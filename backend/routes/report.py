from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Dispatch, Party, Product, db

report = Blueprint('report', __name__, url_prefix='/report')

# ---------------- DISPATCH REPORT ----------------
@report.route('/dispatch', methods=['GET'])
@jwt_required()
def get_dispatch_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Dispatch.query

    if start_date:
        query = query.filter(Dispatch.date_dispatched >= start_date)
    if end_date:
        query = query.filter(Dispatch.date_dispatched <= end_date)

    dispatches = query.order_by(Dispatch.date_dispatched.desc()).all()

    return jsonify({
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
            } for d in dispatches
        ]
    }), 200

# ---------------- SUPPLY REPORT ----------------
@report.route('/supply', methods=['GET'])
@jwt_required()
def get_supply_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Dispatch.query

    if start_date:
        query = query.filter(Dispatch.date_dispatched >= start_date)
    if end_date:
        query = query.filter(Dispatch.date_dispatched <= end_date)

    supplies = query.order_by(Dispatch.date_dispatched.desc()).all()

    return jsonify({
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
            } for s in supplies
        ]
    }), 200

@report.route('/max-sold-product', methods=['GET'])
@jwt_required()
def max_sold_product():
    result = db.session.query(
        Dispatch.product_id,
        db.func.sum(Dispatch.quantity).label('total_sold')
    ).group_by(Dispatch.product_id)\
     .order_by(db.func.sum(Dispatch.quantity).desc())\
     .first()

    if not result:
        return jsonify({"msg": "No data available"}), 404

    product = Product.query.get(result.product_id)

    return jsonify({
        "product_id": product.id,
        "product_name": product.name,
        "total_sold": result.total_sold
    }), 200

@report.route('/frequent-party', methods=['GET'])
@jwt_required()
def frequent_party():
    result = db.session.query(
        Dispatch.party_id,
        db.func.count(Dispatch.id).label('dispatch_count')
    ).group_by(Dispatch.party_id)\
     .order_by(db.func.count(Dispatch.id).desc())\
     .first()

    if not result:
        return jsonify({"msg": "No data available"}), 404

    party = Party.query.get(result.party_id)

    return jsonify({
        "party_id": party.id,
        "party_name": party.name,
        "dispatch_count": result.dispatch_count
    }), 200



@report.route('/stock-wise-products', methods=['GET'])
@jwt_required()
def stock_wise_products():
    products = Product.query.order_by(Product.stock.asc()).all()

    result = []
    for p in products:
        result.append({
            "product_id": p.id,
            "product_name": p.name,
            "stock": p.stock,
            "unit": p.unit,
            "status": "Low Stock" if p.stock < 10 else "Normal"
        })

    return jsonify(result), 200


