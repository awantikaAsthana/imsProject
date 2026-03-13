
from flask import Flask
from flask_restx import Api
from routes.stock import stock
from routes.supply import supply
from routes.dispatch import dispatch
from routes.product import product_bp
from routes.supplier import supplier_bp
from config import Config
from extensions import db, bcrypt, jwt
from routes.auth import auth
from flask_cors import CORS

from models import TokenBlocklist

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True
)

app.config.from_object(Config)
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)


app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(product_bp, url_prefix='/api/product')
app.register_blueprint(stock, url_prefix='/api/stock')
app.register_blueprint(supply, url_prefix='/api/supply')
app.register_blueprint(supplier_bp, url_prefix='/api/supplier')
app.register_blueprint(dispatch, url_prefix='/api/dispatch')


with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True)

