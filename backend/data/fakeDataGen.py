# Copy the database to a writable file and populate it with fake data
import sqlite3, random, shutil
from datetime import datetime, timedelta

src = "backend/instance/users.db"
dst = "backend/instance/users_fake_fy25_26.db"
shutil.copy(src, dst)

conn = sqlite3.connect(dst)
cur = conn.cursor()

start_date = datetime(2025,4,1)
end_date = datetime(2026,3,31)

def random_date():
    delta = end_date - start_date
    return (start_date + timedelta(days=random.randint(0, delta.days))).strftime("%Y-%m-%d %H:%M:%S")

products = [
    ("Cotton Fabric Roll","Premium cotton fabric",220,150,500,"meter"),
    ("Polyester Blend","Poly blend for shirts",180,120,600,"meter"),
    ("Denim Fabric","Heavy denim fabric",350,250,400,"meter"),
    ("Linen Fabric","Breathable linen cloth",420,300,300,"meter"),
    ("Silk Fabric","Luxury silk textile",900,650,200,"meter"),
    ("Rayon Fabric","Soft rayon material",260,190,450,"meter"),
]

for p in products:
    cur.execute("""
    INSERT INTO product (name, description, sp, cp, stock, is_active, unit, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, 4, ?)
    """,(p[0],p[1],p[2],p[3],p[4],p[5], random_date()))

parties = [
    ("Alpha Garments","alpha@gmail.com","Delhi","07ABCDE1234F1Z5"),
    ("Metro Fashion","metro@gmail.com","Noida","09PQRSX5678L1Z2"),
    ("Urban Threads","urban@gmail.com","Gurgaon","06LMNOP3456A1Z3"),
    ("Style Hub","style@gmail.com","Jaipur","08FGHIJ2345K1Z7"),
    ("Trend Wear","trend@gmail.com","Ludhiana","03WXYZ9876M1Z4"),
    ("Royal Apparel","royal@gmail.com","Surat","24ABCDE5678P1Z9")
]

for p in parties:
    cur.execute("""
    INSERT INTO party (name, contact_info, address, gstin_number)
    VALUES (?, ?, ?, ?)
    """,p)

product_ids = [r[0] for r in cur.execute("SELECT id FROM product").fetchall()]
party_ids = [r[0] for r in cur.execute("SELECT id FROM party").fetchall()]

for i in range(80):
    cur.execute("""
    INSERT INTO supply (product_id, quantity, supplier, date_supplied, party_id, e_waybill_number_s, challan_number, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,(
        random.choice(product_ids),
        random.randint(50,400),
        random.choice(["Textile Hub","Global Fabrics","RawTex Ltd","Fabric World"]),
        random_date(),
        random.choice(party_ids),
        f"EWB-S-{random.randint(10000,99999)}",
        f"CH-S-{random.randint(10000,99999)}",
        random.choice(["Regular supply","Bulk purchase","Urgent stock","Seasonal order"])
    ))

for i in range(80):
    cur.execute("""
    INSERT INTO dispatch (product_id, quantity, recipient, date_dispatched, dispatched_address, party_id, e_waybill_number, challan_number, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,(
        random.choice(product_ids),
        random.randint(20,200),
        random.choice(["Alpha Garments","Metro Fashion","Urban Threads","Style Hub","Trend Wear","Royal Apparel"]),
        random_date(),
        random.choice(["Delhi","Noida","Gurgaon","Jaipur","Ludhiana","Surat"]),
        random.choice(party_ids),
        f"EWB-D-{random.randint(10000,99999)}",
        f"CH-D-{random.randint(10000,99999)}",
        random.choice(["Retail shipment","Bulk dispatch","Festival demand","Regular order"])
    ))

conn.commit()
conn.close()

print("Fake dataset generated:", dst)