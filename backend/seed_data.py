"""
seed_data.py
============
Generates 1 full year (Jan 2024 → Dec 2024) of realistic
dummy data for a textile dyeing company that processes
dyed fabric measured in MTRS.

Usage
─────
    python seed_data.py
"""

import random
import string
from datetime import datetime, timedelta

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ⚠ ADJUST THIS IMPORT TO MATCH YOUR PROJECT
#
#    If your file is  app.py   →  from app import app
#    If your file is  main.py  →  from main import app
#    If your file is  run.py   →  from run import app
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
from app import app  # ← change this line if needed

from extensions import db
from models import (
    User,
    Product,
    Party,
    Supplier,
    Supply,
    Dispatch,
    TokenBlocklist,
)

random.seed(42)

# ================================================================
#  REFERENCE DATA
# ================================================================

START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2024, 12, 31)

FABRICS = [
    "Cotton",
    "Polyester",
    "Silk",
    "Rayon",
    "Linen",
    "Chiffon",
    "Georgette",
    "Crepe",
    "Denim",
    "Velvet",
    "Satin",
    "Muslin",
    "Cambric",
    "Poplin",
    "Twill",
]

COLOURS = [
    "Indigo Blue",
    "Jet Black",
    "Ruby Red",
    "Emerald Green",
    "Mustard Yellow",
    "Coral Pink",
    "Navy Blue",
    "Maroon",
    "Olive Green",
    "Burnt Orange",
    "Lavender",
    "Teal",
    "Charcoal Grey",
    "Wine Red",
    "Sky Blue",
    "Ivory White",
    "Forest Green",
    "Peach",
    "Burgundy",
    "Aqua",
]

CP_RANGE = {
    "Cotton": (55, 110),
    "Polyester": (40, 85),
    "Silk": (220, 480),
    "Rayon": (50, 100),
    "Linen": (110, 200),
    "Chiffon": (75, 150),
    "Georgette": (85, 170),
    "Crepe": (80, 160),
    "Denim": (95, 190),
    "Velvet": (140, 280),
    "Satin": (100, 210),
    "Muslin": (65, 130),
    "Cambric": (60, 120),
    "Poplin": (55, 115),
    "Twill": (70, 140),
}

MARGIN = (1.15, 1.45)

PARTY_DATA = [
    ("Arvind Fashions Ltd", "Mumbai"),
    ("Raymond Textiles Pvt Ltd", "Thane"),
    ("Welspun India Ltd", "Ahmedabad"),
    ("Vardhman Textiles", "Ludhiana"),
    ("Trident Group", "Barnala"),
    ("Bombay Dyeing Co", "Mumbai"),
    ("Alok Industries", "Silvassa"),
    ("Indo Count Industries", "Kolhapur"),
    ("KPR Mill Ltd", "Coimbatore"),
    ("Grasim Industries", "Nagda"),
    ("Siyaram Silk Mills", "Mumbai"),
    ("Donear Industries", "Ahmedabad"),
    ("Rupa & Company", "Kolkata"),
    ("Nitin Spinners Ltd", "Bhilwara"),
    ("Sangam India Ltd", "Bhilwara"),
    ("Sutlej Textiles", "Ludhiana"),
    ("Ambika Cotton Mills", "Ahmedabad"),
    ("Nahar Industrial Enterprises", "Ludhiana"),
    ("Lakshmi Mills Co", "Coimbatore"),
    ("Mafatlal Industries", "Mumbai"),
]

SUPPLIER_DATA = [
    ("Shree Balaji Fabrics", "GIDC Industrial Area, Surat, Gujarat"),
    ("Mahalaxmi Textile Mills", "Parvati Industrial Estate, Ahmedabad"),
    ("Guru Nanak Handloom", "Focal Point Phase-V, Ludhiana, Punjab"),
    ("Sunrise Weaving Works", "MIDC Bhiwandi, Maharashtra"),
    ("Patel Silk Industries", "Ring Road, Surat, Gujarat"),
    ("Rajdhani Fabrics", "Karol Bagh, New Delhi"),
    ("Om Sai Raw Materials", "Market Yard, Ichalkaranji, Maharashtra"),
    ("Jay Ambe Threads & Yarn", "Pandesara GIDC, Surat"),
    ("Krishna Yarn Supply Co", "Textile Street, Erode, Tamil Nadu"),
    ("Ganesh Fibre Corporation", "Industrial Area, Bhilwara, Rajasthan"),
    ("Bharat Loom House", "Karur, Tamil Nadu"),
    ("Annapurna Textiles", "Power Loom Colony, Malegaon, Maharashtra"),
    ("Durga Spinning Mills", "Mettur Road, Salem, Tamil Nadu"),
    ("Evergreen Fibre Ltd", "Sector-29, Panipat, Haryana"),
    ("National Fabric Supply Co", "Fazalganj, Kanpur, UP"),
]

USER_DATA = [
    ("Admin User", "admin@textdye.com", "admin"),
    ("Rajesh Kumar", "rajesh@textdye.com", "manager"),
    ("Priya Sharma", "priya@textdye.com", "manager"),
    ("Amit Patel", "amit@textdye.com", "user"),
    ("Sunita Verma", "sunita@textdye.com", "user"),
]

SUPPLY_REMARKS = [
    None,
    "Urgent replenishment order",
    "Regular monthly supply",
    "Quality checked – OK",
    "Sample lot for testing",
    "Bulk order – discounted rate",
    "Advance delivery against next month PO",
    "Replacement for rejected lot",
    "New shade trial batch",
    "Imported raw grey fabric",
]

DISPATCH_REMARKS = [
    None,
    "Delivered on time",
    "Partial shipment – balance next week",
    "Express delivery requested",
    "Regular monthly order",
    "Client requested early dispatch",
    "COD shipment",
    "Prepaid – paid via NEFT",
    "Festival season rush order",
    "Export consignment",
]

SUPPLY_SEASON = {
    1: 1.6, 2: 1.4, 3: 1.1, 4: 1.0,
    5: 0.9, 6: 0.8, 7: 0.7, 8: 0.7,
    9: 1.0, 10: 1.3, 11: 1.3, 12: 1.0,
}

DISPATCH_SEASON = {
    1: 0.5, 2: 0.7, 3: 1.2, 4: 1.1,
    5: 1.0, 6: 0.8, 7: 0.6, 8: 0.7,
    9: 1.1, 10: 1.5, 11: 1.5, 12: 1.1,
}


# ================================================================
#  HELPERS
# ================================================================


def rand_gstin() -> str:
    state = random.choice(
        ["27", "24", "09", "33", "03", "29", "36", "08", "07", "06"]
    )
    pan = (
        "".join(random.choices(string.ascii_uppercase, k=5))
        + "".join(random.choices(string.digits, k=4))
        + random.choice(string.ascii_uppercase)
    )
    return f"{state}{pan}1Z{random.choice(string.ascii_uppercase)}"


def rand_phone() -> str:
    return f"+91 {''.join(random.choices(string.digits, k=10))}"


def rand_ewb() -> str:
    return f"EWB{''.join(random.choices(string.digits, k=12))}"


def rand_challan() -> str:
    return f"CH-{''.join(random.choices(string.digits, k=8))}"


def rand_time(date: datetime) -> datetime:
    return date.replace(
        hour=random.randint(8, 18),
        minute=random.randint(0, 59),
        second=random.randint(0, 59),
    )


# ================================================================
#  SEED
# ================================================================


def seed():

    # ── use app.app_context() directly ────────────────────
    with app.app_context():

        print("\n⚠  This will DROP all tables and recreate them.")
        confirm = input("   Continue? (y/N): ").strip().lower()
        if confirm != "y":
            print("   Aborted.")
            return

        # ── reset DB ──────────────────────────────────────
        print("\n⏳  Dropping old data …")
        db.drop_all()
        db.create_all()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        #  USERS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("👤  Creating users …")
        users = []
        for name, email, role in USER_DATA:
            u = User(
                name=name,
                email=email,
                role=role,
                status="active",
                created_at=START_DATE - timedelta(days=random.randint(30, 365)),
            )
            u.set_password("password123")
            db.session.add(u)
            users.append(u)
        db.session.flush()

        admin_id = users[0].id

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        #  PRODUCTS — 25 fabric × colour combos
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("📦  Creating 25 products …")
        combos: set[tuple[str, str]] = set()
        while len(combos) < 25:
            combos.add((random.choice(FABRICS), random.choice(COLOURS)))

        products = []
        for fabric, colour in sorted(combos):
            lo, hi = CP_RANGE[fabric]
            cp = round(random.uniform(lo, hi), 2)
            sp = round(cp * random.uniform(*MARGIN), 2)

            p = Product(
                name=f"{fabric} Dyed – {colour}",
                description=(
                    f"Premium {fabric.lower()} fabric dyed in "
                    f"{colour.lower()} shade. Width 44-58 inches. "
                    f"Suitable for garments and home textiles."
                ),
                cp=cp,
                sp=sp,
                stock=0,
                unit="MTRS",
                is_active=True,
                created_by=admin_id,
                created_at=START_DATE - timedelta(days=random.randint(1, 30)),
            )
            db.session.add(p)
            products.append(p)

        db.session.flush()

        product_ids = [p.id for p in products]
        stock_tracker: dict[int, int] = {pid: 0 for pid in product_ids}

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        #  PARTIES — 20 buyers
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("🏢  Creating 20 parties …")
        parties = []
        for name, city in PARTY_DATA:
            pa = Party(
                name=name,
                contact_info=rand_phone(),
                address=f"Plot {random.randint(1, 500)}, Industrial Area, {city}",
                gstin_number=rand_gstin(),
            )
            db.session.add(pa)
            parties.append(pa)
        db.session.flush()
        party_ids = [p.id for p in parties]

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        #  SUPPLIERS — 15 vendors
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("🚚  Creating 15 suppliers …")
        suppliers = []
        for name, addr in SUPPLIER_DATA:
            s = Supplier(name=name, address=addr, gst=rand_gstin())
            db.session.add(s)
            suppliers.append(s)
        db.session.flush()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        #  SUPPLY + DISPATCH — day-by-day simulation
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("📊  Generating supply & dispatch records …")

        SUPPLY_QTYS = [50, 100, 150, 200, 250, 300, 400, 500, 750, 1000]
        DISPATCH_QTYS = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750]

        supply_count = 0
        dispatch_count = 0
        business_days = 0

        current = START_DATE
        while current <= END_DATE:

            # skip Sundays
            if current.weekday() == 6:
                current += timedelta(days=1)
                continue

            business_days += 1
            month = current.month

            # ── SUPPLIES for this day ─────────────────
            base_supply = random.randint(2, 5)
            n_supply = max(1, int(base_supply * SUPPLY_SEASON[month]))

            for _ in range(n_supply):
                pid = random.choice(product_ids)
                qty = random.choice(SUPPLY_QTYS)
                sup = random.choice(suppliers)

                supply = Supply(
                    product_id=pid,
                    quantity=qty,
                    supplier=sup.name,
                    date_supplied=rand_time(current),
                    party_id=(
                        random.choice(party_ids)
                        if random.random() > 0.3
                        else None
                    ),
                    e_waybill_number_s=rand_ewb(),
                    challan_number=rand_challan(),
                    remarks=random.choice(SUPPLY_REMARKS),
                )
                db.session.add(supply)
                stock_tracker[pid] += qty
                supply_count += 1

                if (
                    sup.last_supplied_date is None
                    or current > sup.last_supplied_date
                ):
                    sup.last_supplied_date = current

            # ── DISPATCHES for this day ───────────────
            base_dispatch = random.randint(2, 6)
            n_dispatch = max(1, int(base_dispatch * DISPATCH_SEASON[month]))

            for _ in range(n_dispatch):
                pid = random.choice(product_ids)
                available = stock_tracker[pid]

                if available < 25:
                    continue

                eligible = [q for q in DISPATCH_QTYS if q <= available]
                if not eligible:
                    continue

                qty = random.choice(eligible)
                party = random.choice(parties)

                dispatch = Dispatch(
                    product_id=pid,
                    quantity=qty,
                    recipient=party.name,
                    date_dispatched=rand_time(current),
                    dispatched_address=party.address,
                    party_id=party.id,
                    e_waybill_number=rand_ewb(),
                    challan_number=rand_challan(),
                    remarks=random.choice(DISPATCH_REMARKS),
                )
                db.session.add(dispatch)
                stock_tracker[pid] -= qty
                dispatch_count += 1

            # flush every 30 business days
            if business_days % 30 == 0:
                db.session.flush()

            current += timedelta(days=1)

        # ── set final stock on each product ───────────
        for p in products:
            p.stock = stock_tracker[p.id]

        # ── COMMIT ────────────────────────────────────
        db.session.commit()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        #  SUMMARY
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        total_stock = sum(stock_tracker.values())
        low_stock = sum(1 for v in stock_tracker.values() if v < 10)

        print("\n" + "=" * 50)
        print("  ✅  SEED COMPLETE")
        print("=" * 50)
        print(f"  Users          :  {len(users)}")
        print(f"  Products       :  {len(products)}")
        print(f"  Parties        :  {len(parties)}")
        print(f"  Suppliers      :  {len(suppliers)}")
        print(f"  Supply records :  {supply_count}")
        print(f"  Dispatch records: {dispatch_count}")
        print(f"  Business days  :  {business_days}")
        print("-" * 50)
        print(f"  Total stock    :  {total_stock:,} MTRS")
        print(f"  Low stock (<10):  {low_stock} products")
        print(f"  Passwords      :  password123 (all users)")
        print("=" * 50 + "\n")


if __name__ == "__main__":
    seed()