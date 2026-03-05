from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Supply, User, db
from utils.api_response import api_response

supply = Blueprint('supply', __name__, url_prefix='/supply')


@supply.route('/create', methods=['POST'])
@jwt_required()
def create_supply():
    data = request.get_json()

    if not data or not all(k in data for k in ("product_id", "quantity", "supplier")):
        return api_response(status_code=400, message="Missing required fields")

    supply = Supply(
        product_id=data['product_id'],
        quantity=data['quantity'],
        supplier=data['supplier'],
        party_id=data.get('party_id'),
        e_waybill_number_s=data.get('e_waybill_number'),
        challan_number=data.get('challan_number'),
        date_supplied=data.get('date_supplied'),
        remarks=data.get('remarks')
    )

    db.session.add(supply)
    db.session.commit()

    return api_response(status_code=201, message="Supply record created successfully")


@supply.route('/history', methods=['GET'])
@jwt_required()
def get_supply_history():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = Supply.query.order_by(Supply.id.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return api_response(status_code=200, message="Supply history retrieved successfully", data={
        "data": [
            {
                "id": s.id,
                "product_id": s.product_id,
                "quantity": s.quantity,
                "supplier": s.supplier,
                "party_id": s.party_id,
                "e_waybill_number_s": s.e_waybill_number_s,
                "challan_number": s.challan_number,
                "date_supplied": s.date_supplied.isoformat() if s.date_supplied else None,
                "remarks": s.remarks
            } for s in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    })


@supply.route('/product/<int:product_id>/supplies', methods=['GET'])
@jwt_required()
def get_product_supplies(product_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = Supply.query.filter_by(product_id=product_id)\
        .order_by(Supply.id.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return api_response(status_code=200, message="Product supplies retrieved successfully", data={
        "data": [
            {
                "id": s.id,
                "product_id": s.product_id,
                "quantity": s.quantity,
                "supplier": s.supplier,
                "party_id": s.party_id,
                "e_waybill_number_s": s.e_waybill_number_s,
                "challan_number": s.challan_number,
                "date_supplied": s.date_supplied.isoformat() if s.date_supplied else None,
                "remarks": s.remarks
            } for s in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages
        }
    })


@supply.route('/party/<int:party_id>', methods=['GET'])
@jwt_required()
def get_supplies_by_party(party_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = Supply.query.filter_by(party_id=party_id)\
        .order_by(Supply.id.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return api_response(status_code=200, message="Supplies by party retrieved successfully", data={
        "data": [
            {
                "id": s.id,
                "product_id": s.product_id,
                "quantity": s.quantity,
                "supplier": s.supplier,
                "party_id": s.party_id,
                "e_waybill_number_s": s.e_waybill_number_s,
                "challan_number": s.challan_number,
                "date_supplied": s.date_supplied.isoformat() if s.date_supplied else None,
                "remarks": s.remarks
            } for s in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages
        }
    })


@supply.route('/edit/<int:supply_id>', methods=['PUT'])
@jwt_required()
def edit_supply(supply_id):
    supply = Supply.query.get_or_404(supply_id)
    data = request.get_json()

    if not data:
        return api_response(status_code=400, message="No data provided")

    supply.product_id = data.get('product_id', supply.product_id)
    supply.quantity = data.get('quantity', supply.quantity)
    supply.supplier = data.get('supplier', supply.supplier)
    supply.party_id = data.get('party_id', supply.party_id)
    supply.e_waybill_number_s = data.get('e_waybill_number_s', supply.e_waybill_number_s)
    supply.challan_number = data.get('challan_number', supply.challan_number)
    supply.date_supplied = data.get('date_supplied', supply.date_supplied)
    supply.remarks = data.get('remarks', supply.remarks)

    db.session.commit()

    return api_response(status_code=200, message="Supply record updated successfully")


@supply.route('/delete/<int:supply_id>', methods=['DELETE'])
@jwt_required()
def delete_supply(supply_id):
    supply = Supply.query.get_or_404(supply_id)
    db.session.delete(supply)
    db.session.commit()

    return api_response(status_code=200, message="Supply record deleted successfully")
