from datetime import datetime
from extensions import db, bcrypt

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    name= db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='user')
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    
    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
    
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)

class Product(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(100), nullable=False) 
    description= db.Column(db.Text, nullable=True)
    sp= db.Column(db.Float, nullable=False)
    cp= db.Column(db.Float, nullable=False)
    stock= db.Column(db.Integer, nullable=False, default=0)
    is_active= db.Column(db.Boolean, nullable=False, default=True)
    unit= db.Column(db.String(50), nullable=False)
    created_by= db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at= db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

class Supply(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    supplier = db.Column(db.String(100), nullable=False)
    date_supplied = db.Column(db.DateTime, default=datetime.utcnow)
    party_id = db.Column(db.Integer, db.ForeignKey('party.id'))
    e_waybill_number_s = db.Column(db.String(100))
    challan_number = db.Column(db.String(100))
    remarks = db.Column(db.Text, nullable=True)

    @staticmethod
    def add_supply(product_id, quantity, **kwargs):
        if quantity <= 0:
            raise ValueError("Quantity must be positive")

        product = Product.query.get(product_id)
        if not product:
            raise ValueError("Product not found")

        supply = Supply(
            product_id=product_id,
            quantity=quantity,
            **kwargs
        )

        product.stock += quantity

        db.session.add(supply)

        return supply

class Party(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(100), nullable=False)
    contact_info= db.Column(db.String(200), nullable=True)
    address= db.Column(db.Text, nullable=True)
    gstin_number= db.Column(db.String(50), nullable=True)

class Dispatch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    recipient = db.Column(db.String(100), nullable=False)
    date_dispatched = db.Column(db.DateTime, default=datetime.utcnow)
    dispatched_address = db.Column(db.Text)
    party_id = db.Column(db.Integer, db.ForeignKey('party.id'))
    e_waybill_number = db.Column(db.String(100))
    challan_number = db.Column(db.String(100))
    remarks = db.Column(db.Text, nullable=True)

    @staticmethod
    def dispatch_product(product_id, quantity, **kwargs):
        if quantity <= 0:
            raise ValueError("Quantity must be positive")

        product = Product.query.get(product_id)
        if not product:
            raise ValueError("Product not found")

        if product.stock < quantity:
            raise ValueError("Insufficient stock")

        dispatch = Dispatch(
            product_id=product_id,
            quantity=quantity,
            **kwargs
        )

        product.stock -= quantity

        db.session.add(dispatch)
        return dispatch
