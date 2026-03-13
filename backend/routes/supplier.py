from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Supplier, db
from utils.api_response import api_response
from datetime import datetime

supplier_bp = Blueprint('supplier', __name__, url_prefix='/supplier')


# ---------------- CREATE SUPPLIER ----------------
@supplier_bp.route('/create', methods=['POST'])
@jwt_required()
def create_supplier():
    data = request.get_json()

    if not data or not all(k in data for k in ("name", "address", "gst")):
        return api_response(status_code=400, message="Missing required fields")

    date_supplied = None
    if data.get("date_supplied"):
        date_supplied = datetime.strptime(data["date_supplied"], "%Y-%m-%d")

    supply = Supply(
    product_id=int(data['product_id']),
    quantity=int(data['quantity']),
    supplier=data['supplier'],
    party_id=data.get('party_id'),
    e_waybill_number_s=data.get('e_waybill_number'),
    challan_number=data.get('challan_number'),
    date_supplied=date_supplied,
    remarks=data.get('remarks')
)

    db.session.add(supplier)
    db.session.commit()

    return api_response(status_code=201, message="Supplier created successfully")


# ---------------- GET ALL SUPPLIERS ----------------
@supplier_bp.route('/', methods=['GET'])
@jwt_required()
def get_suppliers():

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    pagination = Supplier.query.order_by(Supplier.created_at.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    suppliers = pagination.items

    return api_response(status_code=200, message="Suppliers retrieved successfully", data={
        "data": [
            {
                "id": s.id,
                "name": s.name,
                "address": s.address,
                "gst": s.gst,
                "last_supplied_date": s.last_supplied_date.strftime("%Y-%m-%d") if s.last_supplied_date else None,
                "created_at": s.created_at.strftime("%Y-%m-%d")
            } for s in suppliers
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


# ---------------- GET SINGLE SUPPLIER ----------------
@supplier_bp.route('/<int:supplier_id>', methods=['GET'])
@jwt_required()
def get_supplier(supplier_id):

    supplier = Supplier.query.get_or_404(supplier_id)

    return api_response(status_code=200, message="Supplier retrieved successfully", data={
        "id": supplier.id,
        "name": supplier.name,
        "address": supplier.address,
        "gst": supplier.gst,
        "last_supplied_date": supplier.last_supplied_date.strftime("%Y-%m-%d") if supplier.last_supplied_date else None,
        "created_at": supplier.created_at.strftime("%Y-%m-%d")
    })


# ---------------- UPDATE SUPPLIER ----------------
@supplier_bp.route('/<int:supplier_id>', methods=['PUT'])
@jwt_required()
def update_supplier(supplier_id):

    supplier = Supplier.query.get_or_404(supplier_id)
    data = request.get_json()

    if not data:
        return api_response(status_code=400, message="No data provided")

    supplier.name = data.get("name", supplier.name)
    supplier.address = data.get("address", supplier.address)
    supplier.gst = data.get("gst", supplier.gst)

    if "last_supplied_date" in data:
        supplier.last_supplied_date = datetime.fromisoformat(data["last_supplied_date"])

    db.session.commit()

    return api_response(status_code=200, message="Supplier updated successfully")


# ---------------- DELETE SUPPLIER ----------------
@supplier_bp.route('/<int:supplier_id>', methods=['DELETE'])
@jwt_required()
def delete_supplier(supplier_id):

    supplier = Supplier.query.get_or_404(supplier_id)

    db.session.delete(supplier)
    db.session.commit()

    return api_response(status_code=200, message="Supplier deleted successfully")