
from flask import Flask
from flask_restx import Api
# Routes : address of the api functions
from routes.stock import stock
from routes.supply import supply
from routes.report import report
from routes.dispatch import dispatch
from routes.product import product_bp
from routes.dashboard  import dashboard
from routes.supplier import supplier_bp

#  configration of environment variables and database connection
from config import Config

from extensions import db, bcrypt, jwt

from routes.auth import auth

# CORS is used to allow cross-origin requests from the frontend to the backend. It is configured to allow requests from any origin and to support credentials (cookies, authorization headers, etc.). The allowed headers are specified to include "Content-Type" and "Authorization".
from flask_cors import CORS

# Using REST api

from models import TokenBlocklist

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},  # Allow requests from any origin to endpoints starting with /api/
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"]
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
app.register_blueprint(report, url_prefix='/api/report')
app.register_blueprint(dashboard, url_prefix='/api/dashboard')


with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True)

