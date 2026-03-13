from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from datetime import datetime

from models import Supply, db, Product, Supplier
from utils.api_response import api_response

supply = Blueprint('supply', __name__, url_prefix='/supply')


# ---------------- CREATE SUPPLY ----------------
@supply.route('/create', methods=['POST'])
@jwt_required()
def create_supply():

    data = request.get_json()

    if not data or not all(k in data for k in ("product_id", "quantity", "supplier")):
        return api_response(400, "Missing required fields")

    try:

        date_supplied = None
        if data.get("date_supplied"):
            date_supplied = datetime.strptime(data["date_supplied"], "%Y-%m-%d")

        product_id = int(data["product_id"])
        quantity = int(data["quantity"])
        party_id = int(data["party_id"]) if data.get("party_id") else None

        supply_record = Supply.add_supply(
            product_id=product_id,
            quantity=quantity,
            supplier=data["supplier"],
            party_id=party_id,
            e_waybill_number_s=data.get("e_waybill_number"),
            challan_number=data.get("challan_number"),
            date_supplied=date_supplied,
            remarks=data.get("remarks")
        )

        db.session.commit()

        return api_response(201, "Supply record created successfully")

    except ValueError as e:
        return api_response(400, str(e))


# ---------------- SUPPLY HISTORY ----------------
@supply.route('/history', methods=['GET'])
@jwt_required()
def get_supplies():

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = (
        db.session.query(Supply, Product, Supplier)
        .join(Product, Supply.product_id == Product.id)
        .join(Supplier, Supply.party_id == Supplier.id)
        .order_by(Supply.id.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return api_response(
        200,
        "Supplies fetched successfully",
        {
            "data": [
                {
                    "id": s.Supply.id,
                    "product_name": s.Product.name,
                    "supplier_name": s.Supplier.name,
                    "quantity": s.Supply.quantity,
                    "date_supplied": s.Supply.date_supplied.strftime("%Y-%m-%d") if s.Supply.date_supplied else None,
                }
                for s in pagination.items
            ],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_items": pagination.total,
                "total_pages": pagination.pages,
            },
        },
    )


# ---------------- SUPPLIES BY PRODUCT ----------------
@supply.route('/product/<int:product_id>/supplies', methods=['GET'])
@jwt_required()
def get_product_supplies(product_id):

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = (
        Supply.query
        .filter_by(product_id=product_id)
        .order_by(Supply.id.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return api_response(
        200,
        "Product supplies retrieved successfully",
        {
            "data": [
                {
                    "id": s.id,
                    "product_id": s.product_id,
                    "quantity": s.quantity,
                    "supplier": s.supplier,
                    "party_id": s.party_id,
                    "e_waybill_number_s": s.e_waybill_number_s,
                    "challan_number": s.challan_number,
                    "date_supplied": s.date_supplied.strftime("%Y-%m-%d") if s.date_supplied else None,
                    "remarks": s.remarks
                }
                for s in pagination.items
            ],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_items": pagination.total,
                "total_pages": pagination.pages
            }
        }
    )


# ---------------- SUPPLIES BY PARTY ----------------
@supply.route('/party/<int:party_id>', methods=['GET'])
@jwt_required()
def get_supplies_by_party(party_id):

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = (
        Supply.query
        .filter_by(party_id=party_id)
        .order_by(Supply.id.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return api_response(
        200,
        "Supplies by party retrieved successfully",
        {
            "data": [
                {
                    "id": s.id,
                    "product_id": s.product_id,
                    "quantity": s.quantity,
                    "supplier": s.supplier,
                    "party_id": s.party_id,
                    "e_waybill_number_s": s.e_waybill_number_s,
                    "challan_number": s.challan_number,
                    "date_supplied": s.date_supplied.strftime("%Y-%m-%d") if s.date_supplied else None,
                    "remarks": s.remarks
                }
                for s in pagination.items
            ],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_items": pagination.total,
                "total_pages": pagination.pages
            }
        }
    )


# ---------------- EDIT SUPPLY ----------------
@supply.route('/edit/<int:supply_id>', methods=['PUT'])
@jwt_required()
def edit_supply(supply_id):

    supply_record = Supply.query.get_or_404(supply_id)
    product = Product.query.get(supply_record.product_id)

    data = request.get_json()

    if not data:
        return api_response(400, "No data provided")

    new_quantity = int(data.get("quantity", supply_record.quantity))
    difference = new_quantity - supply_record.quantity

    # adjust stock
    product.stock += difference

    supply_record.quantity = new_quantity
    supply_record.supplier = data.get('supplier', supply_record.supplier)
    supply_record.party_id = data.get('party_id', supply_record.party_id)
    supply_record.e_waybill_number_s = data.get('e_waybill_number_s', supply_record.e_waybill_number_s)
    supply_record.challan_number = data.get('challan_number', supply_record.challan_number)
    supply_record.remarks = data.get('remarks', supply_record.remarks)

    if data.get("date_supplied"):
        supply_record.date_supplied = datetime.strptime(data["date_supplied"], "%Y-%m-%d")

    db.session.commit()

    return api_response(200, "Supply record updated successfully")


# ---------------- DELETE SUPPLY ----------------
@supply.route('/delete/<int:supply_id>', methods=['DELETE'])
@jwt_required()
def delete_supply(supply_id):

    supply_record = Supply.query.get_or_404(supply_id)
    product = Product.query.get(supply_record.product_id)

    # restore stock
    product.stock -= supply_record.quantity

    db.session.delete(supply_record)
    db.session.commit()

    return api_response(200, "Supply record deleted successfully")