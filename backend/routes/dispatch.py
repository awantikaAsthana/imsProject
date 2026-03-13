from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from datetime import datetime

from models import Dispatch, Product, db
from utils.api_response import api_response

dispatch = Blueprint('dispatch', __name__, url_prefix='/dispatch')


# ---------------- CREATE DISPATCH ----------------
@dispatch.route('/create', methods=['POST'])
@jwt_required()
def create_dispatch():

    data = request.get_json()

    if not data or not all(k in data for k in ("product_id", "quantity", "recipient")):
        return api_response(400, "Missing required fields")

    try:

        date_dispatched = None
        if data.get("date_dispatched"):
            date_dispatched = datetime.strptime(data["date_dispatched"], "%Y-%m-%d")

        dispatch_record = Dispatch.dispatch_product(
            product_id=int(data["product_id"]),
            quantity=int(data["quantity"]),
            recipient=data["recipient"],
            party_id=data.get("party_id"),
            e_waybill_number=data.get("e_waybill_number"),
            challan_number=data.get("challan_number"),
            dispatched_address=data.get("dispatched_address"),
            date_dispatched=date_dispatched,
            remarks=data.get("remarks")
        )

        db.session.commit()

        return api_response(201, "Dispatch record created successfully")

    except ValueError as e:
        return api_response(400, str(e))


# ---------------- DISPATCH HISTORY ----------------
@dispatch.route('/history', methods=['GET'])
@jwt_required()
def get_dispatch_history():

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = Dispatch.query.order_by(
        Dispatch.id.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(200, "Dispatch history retrieved successfully", {
        "data": [
            {
                "id": d.id,
                "product_id": d.product_id,
                "quantity": d.quantity,
                "recipient": d.recipient,
                "party_id": d.party_id,
                "e_waybill_number": d.e_waybill_number,
                "challan_number": d.challan_number,
                "dispatched_address": d.dispatched_address,
                "date_dispatched": d.date_dispatched.strftime("%Y-%m-%d") if d.date_dispatched else None
            } for d in pagination.items
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


# ---------------- DISPATCHES BY PRODUCT ----------------
@dispatch.route('/product/<int:product_id>/dispatches', methods=['GET'])
@jwt_required()
def get_product_dispatches(product_id):

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = Dispatch.query.filter_by(
        product_id=product_id
    ).order_by(
        Dispatch.id.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(200, "Product dispatches retrieved successfully", {
        "data": [
            {
                "id": d.id,
                "product_id": d.product_id,
                "quantity": d.quantity,
                "recipient": d.recipient,
                "party_id": d.party_id,
                "date_dispatched": d.date_dispatched.strftime("%Y-%m-%d") if d.date_dispatched else None
            } for d in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages
        }
    })


# ---------------- DISPATCHES BY PARTY ----------------
@dispatch.route('/party/<int:party_id>', methods=['GET'])
@jwt_required()
def get_dispatches_by_party(party_id):

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = Dispatch.query.filter_by(
        party_id=party_id
    ).order_by(
        Dispatch.id.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(200, "Dispatches by party retrieved successfully", {
        "data": [
            {
                "id": d.id,
                "product_id": d.product_id,
                "quantity": d.quantity,
                "recipient": d.recipient,
                "party_id": d.party_id,
                "date_dispatched": d.date_dispatched.strftime("%Y-%m-%d") if d.date_dispatched else None
            } for d in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages
        }
    })


# ---------------- EDIT DISPATCH ----------------
@dispatch.route('/edit/<int:dispatch_id>', methods=['PUT'])
@jwt_required()
def edit_dispatch(dispatch_id):

    dispatch_record = Dispatch.query.get_or_404(dispatch_id)
    product = Product.query.get(dispatch_record.product_id)

    data = request.get_json()

    if not data:
        return api_response(400, "No data provided")

    new_quantity = int(data.get("quantity", dispatch_record.quantity))
    difference = new_quantity - dispatch_record.quantity

    if product.stock < difference:
        return api_response(400, "Insufficient stock to increase dispatch quantity")

    product.stock -= difference

    dispatch_record.quantity = new_quantity
    dispatch_record.recipient = data.get("recipient", dispatch_record.recipient)
    dispatch_record.party_id = data.get("party_id", dispatch_record.party_id)
    dispatch_record.e_waybill_number = data.get("e_waybill_number", dispatch_record.e_waybill_number)
    dispatch_record.challan_number = data.get("challan_number", dispatch_record.challan_number)
    dispatch_record.dispatched_address = data.get("dispatched_address", dispatch_record.dispatched_address)

    if data.get("date_dispatched"):
        dispatch_record.date_dispatched = datetime.strptime(data["date_dispatched"], "%Y-%m-%d")

    db.session.commit()

    return api_response(200, "Dispatch record updated successfully")


# ---------------- DELETE DISPATCH ----------------
@dispatch.route('/delete/<int:dispatch_id>', methods=['DELETE'])
@jwt_required()
def delete_dispatch(dispatch_id):

    dispatch_record = Dispatch.query.get_or_404(dispatch_id)

    product = Product.query.get(dispatch_record.product_id)

    # restore stock
    product.stock += dispatch_record.quantity

    db.session.delete(dispatch_record)
    db.session.commit()

    return api_response(200, "Dispatch record deleted successfully")