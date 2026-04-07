from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Dispatch, Product, Supply, db
from utils.api_response import api_response

stock = Blueprint('stock', __name__, url_prefix='/stock')


@stock.route('/product/<int:product_id>/stock', methods=['GET'])
@jwt_required()
def get_product_stock(product_id):
    product = Product.query.get_or_404(product_id)

    return api_response(status_code=200, message="Product stock retrieved successfully", data={
        "product_id": product.id,
        "name": product.name,
        "stock": product.stock,
        "unit": product.unit
    }), 200  

@stock.route('Inventory_value', methods=['GET'])
@jwt_required() 
def get_inventory_value():
    products = Product.query.all()
    total_value = sum(p.stock * p.unit_price for p in products)

    return jsonify({
        "total_inventory_value": total_value
    }), 200


@stock.route('/get_all', methods=['GET'])
@jwt_required()
def get_all_products():
    # Pagination params
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)  # default = 30

    pagination = Product.query.order_by(Product.id.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    products = pagination.items

    return api_response(status_code=200, message="All products retrieved successfully", data={
        "data": [
            {
                "product_id": p.id,
                "name": p.name,
                "stock": p.stock,
                "unit": p.unit
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
    }), 200


