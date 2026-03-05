from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Product, User, db
from utils.api_response import api_response

product_bp = Blueprint('product', __name__, url_prefix='/product')

@product_bp.route('/create', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json()

    if not data or not all(k in data for k in ("name", "sp", "cp", "stock", "unit")):
        return api_response(status_code=400, message="Missing required fields")

    user_id = int(get_jwt_identity())

    product = Product(
        name=data['name'],
        description=data.get('description'),
        sp=data['sp'],
        cp=data['cp'],
        stock=data.get('stock', 0),
        unit=data['unit'],
        created_by=user_id
    )

    db.session.add(product)
    db.session.commit()

    return api_response(status_code=201, message="Product created successfully")


@product_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    # Pagination params
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    pagination = Product.query.order_by(Product.created_at.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    products = pagination.items

    return api_response(status_code=200, message="Products retrieved successfully", data={
        "data": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "sp": p.sp,
                "cp": p.cp,
                "stock": p.stock,
                "unit": p.unit,
                "created_by": p.created_by,
                "created_at": p.created_at.isoformat(),
                "is_active": p.is_active
            } for p in products
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


@product_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    product = Product.query.get_or_404(product_id)

    return api_response(status_code=200, message="Product retrieved successfully", data={
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "sp": product.sp,
        "cp": product.cp,
        "stock": product.stock,
        "unit": product.unit,
        "created_by": product.created_by,
        "created_at": product.created_at.isoformat(),
        "is_active": product.is_active
    })


@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()

    if not data:
        return api_response(status_code=400, message="No data provided")

    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.sp = data.get('sp', product.sp)
    product.cp = data.get('cp', product.cp)
    product.stock = data.get('stock', product.stock)
    product.unit = data.get('unit', product.unit)

    db.session.commit()

    return api_response(status_code=200, message="Product updated successfully")


@product_bp.route('/<int:product_id>/deactivate', methods=['PUT'])
@jwt_required()
def deactivate_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False
    db.session.commit()

    return api_response(status_code=200, message="Product deactivated successfully")


@product_bp.route('/<int:product_id>/activate', methods=['PUT'])
@jwt_required()
def activate_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = True
    db.session.commit()

    return api_response(status_code=200, message="Product activated successfully")


@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()

    return api_response(status_code=200, message="Product deleted successfully")
