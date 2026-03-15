from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from models import Product, User, Dispatch, Supply, Supplier, db
from utils.api_response import api_response
from datetime import datetime, timedelta
from sqlalchemy import func, case, desc

dashboard = Blueprint("dashboard", __name__, url_prefix="/dashboard")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STATS — summary cards
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@dashboard.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    now = datetime.utcnow()
    last_30 = now - timedelta(days=30)
    prev_30 = now - timedelta(days=60)
    last_7 = now - timedelta(days=7)

    # ── total products ────────────────────────────────
    total_products = Product.query.filter_by(is_active=True).count()

    products_this_month = Product.query.filter(
        Product.created_at >= last_30,
        Product.is_active == True,
    ).count()

    products_prev_month = Product.query.filter(
        Product.created_at >= prev_30,
        Product.created_at < last_30,
        Product.is_active == True,
    ).count()

    if products_prev_month > 0:
        product_change = round(
            ((products_this_month - products_prev_month) / products_prev_month) * 100,
            1,
        )
    else:
        product_change = 100.0 if products_this_month > 0 else 0.0

    # ── low stock items (stock < 10) ──────────────────
    low_stock_items = Product.query.filter(
        Product.stock < 10,
        Product.is_active == True,
    ).count()

    # ── active users ──────────────────────────────────
    active_users = User.query.filter_by(status="active").count()

    new_users_this_week = User.query.filter(
        User.created_at >= last_7,
        User.status == "active",
    ).count()

    # ── inventory value (stock × selling price) ───────
    inventory_value = (
        db.session.query(func.sum(Product.stock * Product.sp))
        .filter(Product.is_active == True)
        .scalar()
        or 0
    )

    # ── inventory value change ────────────────────────
    dispatch_this_month = (
        db.session.query(func.sum(Dispatch.quantity * Product.sp))
        .join(Product, Dispatch.product_id == Product.id)
        .filter(Dispatch.date_dispatched >= last_30)
        .scalar()
        or 0
    )

    dispatch_prev_month = (
        db.session.query(func.sum(Dispatch.quantity * Product.sp))
        .join(Product, Dispatch.product_id == Product.id)
        .filter(
            Dispatch.date_dispatched >= prev_30,
            Dispatch.date_dispatched < last_30,
        )
        .scalar()
        or 0
    )

    if dispatch_prev_month > 0:
        value_change = round(
            ((dispatch_this_month - dispatch_prev_month) / dispatch_prev_month) * 100,
            1,
        )
    else:
        value_change = 0.0

    # ── overall sales trend (this month vs last) ──────
    if dispatch_prev_month > 0:
        sales_trend = round(
            ((dispatch_this_month - dispatch_prev_month) / dispatch_prev_month) * 100,
            1,
        )
    else:
        sales_trend = 0.0

    return api_response(
        status_code=200,
        message="Dashboard stats retrieved",
        data={
            "total_products": total_products,
            "product_change": product_change,
            "low_stock_items": low_stock_items,
            "active_users": active_users,
            "new_users_this_week": new_users_this_week,
            "inventory_value": round(float(inventory_value), 2),
            "value_change": value_change,
            "sales_trend": sales_trend,
        },
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  SALES CHART — weekly / monthly / yearly
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@dashboard.route("/sales", methods=["GET"])
@jwt_required()
def get_sales():
    time_range = request.args.get("range", "monthly")
    now = datetime.utcnow()

    if time_range == "weekly":
        data = _weekly_sales(now)
    elif time_range == "yearly":
        data = _yearly_sales(now)
    else:
        data = _monthly_sales(now)

    return api_response(
        status_code=200,
        message=f"{time_range.capitalize()} sales data retrieved",
        data=data,
    )


def _weekly_sales(now: datetime) -> list[dict]:
    """Last 7 days, one point per day."""
    days = []
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        sales = (
            db.session.query(func.sum(Dispatch.quantity * Product.sp))
            .join(Product, Dispatch.product_id == Product.id)
            .filter(
                Dispatch.date_dispatched >= day_start,
                Dispatch.date_dispatched < day_end,
            )
            .scalar()
            or 0
        )

        days.append(
            {
                "month": day_names[day.weekday()],
                "sales": round(float(sales), 2),
            }
        )

    return days


def _monthly_sales(now: datetime) -> list[dict]:
    """Last 12 months, one point per month."""
    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    months = []

    for i in range(11, -1, -1):
        # calculate target month
        target = now - timedelta(days=i * 30)
        year = target.year
        month = target.month

        month_start = datetime(year, month, 1)
        if month == 12:
            month_end = datetime(year + 1, 1, 1)
        else:
            month_end = datetime(year, month + 1, 1)

        sales = (
            db.session.query(func.sum(Dispatch.quantity * Product.sp))
            .join(Product, Dispatch.product_id == Product.id)
            .filter(
                Dispatch.date_dispatched >= month_start,
                Dispatch.date_dispatched < month_end,
            )
            .scalar()
            or 0
        )

        months.append(
            {
                "month": month_names[month - 1],
                "sales": round(float(sales), 2),
            }
        )

    return months


def _yearly_sales(now: datetime) -> list[dict]:
    """Last 5 years, one point per year."""
    years = []

    for i in range(4, -1, -1):
        year = now.year - i
        year_start = datetime(year, 1, 1)
        year_end = datetime(year + 1, 1, 1)

        sales = (
            db.session.query(func.sum(Dispatch.quantity * Product.sp))
            .join(Product, Dispatch.product_id == Product.id)
            .filter(
                Dispatch.date_dispatched >= year_start,
                Dispatch.date_dispatched < year_end,
            )
            .scalar()
            or 0
        )

        years.append(
            {
                "month": str(year),
                "sales": round(float(sales), 2),
            }
        )

    return years


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RECENT ACTIVITY — last 10 dispatches + supplies
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@dashboard.route("/recent-activity", methods=["GET"])
@jwt_required()
def get_recent_activity():
    activities = []

    # ── recent dispatches ─────────────────────────────
    recent_dispatches = (
        Dispatch.query
        .join(Product, Dispatch.product_id == Product.id)
        .order_by(Dispatch.date_dispatched.desc())
        .limit(10)
        .all()
    )

    for d in recent_dispatches:
        product = Product.query.get(d.product_id)
        party = Supplier.query.get(d.party_id) if d.party_id else None

        activities.append(
            {
                "id": f"dispatch-{d.id}",
                "action": "Product Dispatched",
                "item": f"{product.name} — {d.quantity} {product.unit} to {d.recipient}",
                "user": party.name if party else d.recipient,
                "time": _time_ago(d.date_dispatched),
                "timestamp": d.date_dispatched.isoformat() if d.date_dispatched else None,
                "type": "dispatch",
            }
        )

    # ── recent supplies ───────────────────────────────
    recent_supplies = (
        Supply.query
        .join(Product, Supply.product_id == Product.id)
        .order_by(Supply.date_supplied.desc())
        .limit(10)
        .all()
    )

    for s in recent_supplies:
        product = Product.query.get(s.product_id)

        activities.append(
            {
                "id": f"supply-{s.id}",
                "action": "Stock Received",
                "item": f"{product.name} — {s.quantity} {product.unit} from {s.supplier}",
                "user": s.supplier,
                "time": _time_ago(s.date_supplied),
                "timestamp": s.date_supplied.isoformat() if s.date_supplied else None,
                "type": "supply",
            }
        )

    # sort combined list by timestamp descending, take top 10
    activities.sort(key=lambda x: x["timestamp"] or "", reverse=True)
    activities = activities[:10]

    return api_response(
        status_code=200,
        message="Recent activity retrieved",
        data=activities,
    )


def _time_ago(dt: datetime) -> str:
    """Human-readable relative time."""
    if not dt:
        return "Unknown"

    now = datetime.utcnow()
    diff = now - dt

    seconds = int(diff.total_seconds())
    minutes = seconds // 60
    hours = minutes // 60
    days = diff.days

    if seconds < 60:
        return "Just now"
    elif minutes < 60:
        return f"{minutes} min ago"
    elif hours < 24:
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif days < 7:
        return f"{days} day{'s' if days != 1 else ''} ago"
    elif days < 30:
        weeks = days // 7
        return f"{weeks} week{'s' if weeks != 1 else ''} ago"
    elif days < 365:
        months = days // 30
        return f"{months} month{'s' if months != 1 else ''} ago"
    else:
        years = days // 365
        return f"{years} year{'s' if years != 1 else ''} ago"