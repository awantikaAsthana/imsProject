
from flask import Flask
from config import Config
from extensions import db, bcrypt, jwt
from routes.auth import auth
from models import TokenBlocklist

app = Flask(__name__)

app.config.from_object(Config)
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)


app.register_blueprint(auth, url_prefix='/api/auth')


with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True)

