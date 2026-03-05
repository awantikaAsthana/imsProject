from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, jwt_required, get_jwt_identity
from models import TokenBlocklist, User, db
from utils.api_response import api_response

auth = Blueprint('auth', __name__, url_prefix='/auth')
@auth.route('/register', methods=['POST'])
def register():
    data=request.get_json()
    if(not data or not all(k in data for k in ("email", "password", "name"))):
        return api_response(status_code=400, message="Missing required fields")
    
    if User.query.filter_by(email=data['email']).first():
        return api_response(status_code=409, message="User already exists")
    

    user= User(
        email=data['email']
        ,name=data['name']
        ,role=data.get('role', 'user')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return api_response(status_code=201, message="User created successfully")

@auth.route('/login', methods=['POST'])
def login():
    data= request.get_json()
    if(not data or not all(k in data for k in ("email", "password"))):
        return api_response(status_code=400, message="Missing required fields")
    
    user=User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return api_response(status_code=401, message="Invalid email or password")
    access_token= create_access_token(identity=str(user.id), additional_claims={
    "email": user.email,
    "role": user.role
})
    refresh_token=create_refresh_token(identity=str(user.id), additional_claims={
    "email": user.email,
    "role": user.role
})
    return api_response(status_code=200, message="Login successful", data={
        "access_token": access_token, "refresh_token": refresh_token, "user": {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }})

@auth.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id= int(get_jwt_identity())
    user=User.query.get(user_id)
    if not user:
        return api_response(status_code=404, message="User not found")
    return api_response(status_code=200, message="Profile retrieved successfully", data={
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    })

@auth.route('/logout', methods=['POST'])
@jwt_required()     
def logout():
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))

    db.session.commit()
    return api_response(status_code=200, message="Successfully logged out")

@auth.route('/refresh_logout', methods=['POST'])
@jwt_required(refresh=True)     
def refresh_logout():
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))    
    db.session.commit()
    return api_response(status_code=200, message="Successfully logged out")

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return api_response(status_code=200, message="Token refreshed", data={"access_token": new_access_token})

@auth.route('/update',methods=['PUT'])
@jwt_required()
def update():   
    user_id= int(get_jwt_identity())
    user=User.query.get_or_404(user_id)
    data=request.get_json()
    if not data:
        return api_response(status_code=400, message="No data provided")    
    if 'email' in data:
        if User.query.filter_by(email=data['email']).first():
            return api_response(status_code=409, message="Email already in use")
        user.email=data['email']
    if 'name' in data:
        user.name=data['name']
    if 'role' in data:
        user.role=data['role']
    db.session.commit()
    return api_response(status_code=200, message="Profile updated successfully")    

@auth.route('/change-password', methods=['PUT'])
@jwt_required() 
def change_password():
    user_id=int(get_jwt_identity())
    user=User.query.get_or_404(user_id)
    data=request.get_json() 
    if not data or not all(k in data for k in ("old_password", "new_password")):
        return api_response(status_code=400, message="Missing required fields")
    if not user.check_password(data['old_password']):
        return api_response(status_code=401, message="Old password is incorrect")
    user.set_password(data['new_password'])
    db.session.commit()
    return api_response(status_code=200, message="Password changed successfully")


@auth.route('/delete', methods=['DELETE'])
@jwt_required() 
def delete():
    user_id=int(get_jwt_identity())
    user=User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return api_response(status_code=200, message="Account deleted successfully")