from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Dispatch, Product, db
from utils.api_response import api_response

dispatch = Blueprint('dispatch', __name__, url_prefix='/dispatch')


# ---------------- CREATE DISPATCH ----------------
@dispatch.route('/create', methods=['POST'])
@jwt_required()
def create_dispatch():
    data = request.get_json()

    if not data or not all(k in data for k in ("product_id", "quantity", "recipient")):
        return api_response(status_code=400, message="Missing required fields")

    dispatch_record = Dispatch(
        product_id=data['product_id'],
        quantity=data['quantity'],
        recipient=data['recipient'],
        party_id=data.get('party_id'),
        e_waybill_number=data.get('e_waybill_number'),
        challan_number=data.get('challan_number'),
        dispatched_address=data.get('dispatched_address'),
        date_dispatched=data.get('date_dispatched')
    )

    db.session.add(dispatch_record)
    db.session.commit()

    return api_response(status_code=201, message="Dispatch record created successfully")


# ---------------- DISPATCH HISTORY ----------------
@dispatch.route('/history', methods=['GET'])
@jwt_required()
def get_dispatch_history():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    pagination = Dispatch.query.order_by(
        Dispatch.id.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return api_response(status_code=200, message="Dispatch history retrieved successfully", data={
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
                "date_dispatched": d.date_dispatched.isoformat() if d.date_dispatched else None
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

    return api_response(status_code=200, message="Product dispatches retrieved successfully", data={
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
                "date_dispatched": d.date_dispatched.isoformat() if d.date_dispatched else None
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

    return api_response(status_code=200, message="Dispatches by party retrieved successfully", data={
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
                "date_dispatched": d.date_dispatched.isoformat() if d.date_dispatched else None
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
    data = request.get_json()

    if not data:
        return api_response(status_code=400, message="No data provided")

    dispatch_record.product_id = data.get('product_id', dispatch_record.product_id)
    dispatch_record.quantity = data.get('quantity', dispatch_record.quantity)
    dispatch_record.recipient = data.get('recipient', dispatch_record.recipient)
    dispatch_record.party_id = data.get('party_id', dispatch_record.party_id)
    dispatch_record.e_waybill_number = data.get('e_waybill_number', dispatch_record.e_waybill_number)
    dispatch_record.challan_number = data.get('challan_number', dispatch_record.challan_number)
    dispatch_record.dispatched_address = data.get('dispatched_address', dispatch_record.dispatched_address)
    dispatch_record.date_dispatched = data.get('date_dispatched', dispatch_record.date_dispatched)

    db.session.commit()

    return api_response(status_code=200, message="Dispatch record updated successfully")


# ---------------- DELETE DISPATCH ----------------
@dispatch.route('/delete/<int:dispatch_id>', methods=['DELETE'])
@jwt_required()
def delete_dispatch(dispatch_id):
    dispatch_record = Dispatch.query.get_or_404(dispatch_id)
    db.session.delete(dispatch_record)
    db.session.commit()

    return api_response(status_code=200, message="Dispatch record deleted successfully")
