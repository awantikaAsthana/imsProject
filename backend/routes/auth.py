from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, jwt_required, get_jwt_identity
from models import TokenBlocklist, User, db

auth = Blueprint('auth', __name__, url_prefix='/auth')
@auth.route('/register', methods=['POST'])
def register():
    data=request.get_json()
    if(not data or not all(k in data for k in ("email", "password", "name"))):
        return jsonify({"msg": "Missing required fields"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User already exists"}), 409
    

    user= User(
        email=data['email']
        ,name=data['name']
        ,role=data.get('role', 'user')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@auth.route('/login', methods=['POST'])
def login():
    data= request.get_json()
    if(not data or not all(k in data for k in ("email", "password"))):
        return jsonify({"msg": "Missing required fields"}), 400
    
    user=User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"msg": "Invalid email or password"}), 401
    access_token= create_access_token(identity=str(user.id), additional_claims={
    "email": user.email,
    "role": user.role
})
    refresh_token=create_refresh_token(identity=str(user.id), additional_claims={
    "email": user.email,
    "role": user.role
})
    return jsonify({"access_token": access_token, "refresh_token": refresh_token}), 200

@auth.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id= int(get_jwt_identity())
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }), 200

@auth.route('/logout', methods=['POST'])
@jwt_required()     
def logout():
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))

    db.session.commit()
    return jsonify({"msg": "Successfully logged out"}), 200

@auth.route('/refresh_logout', methods=['POST'])
@jwt_required(refresh=True)     
def refresh_logout():
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))
    
    db.session.commit()
    return jsonify({"msg": "Successfully logged out"}), 200

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify({"access_token": new_access_token}), 200

@auth.route('/update',methods=['PUT'])
@jwt_required()
def update():   
    user_id= int(get_jwt_identity())
    user=User.query.get_or_404(user_id)
    data=request.get_json()
    if not data:
        return jsonify({"msg": "No data provided"}), 400    
    if 'email' in data:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "Email already in use"}), 409
        user.email=data['email']
    if 'name' in data:
        user.name=data['name']
    if 'role' in data:
        user.role=data['role']
    db.session.commit()
    return jsonify({"msg": "Profile updated successfully"}), 200    

@auth.route('/change_password', methods=['PUT'])
@jwt_required() 
def change_password():
    user_id=int(get_jwt_identity())
    user=User.query.get_or_404(user_id)
    data=request.get_json() 
    if not data or not all(k in data for k in ("old_password", "new_password")):
        return jsonify({"msg": "Missing required fields"}), 400
    if not user.check_password(data['old_password']):
        return jsonify({"msg": "Old password is incorrect"}), 401
    user.set_password(data['new_password'])
    db.session.commit()
    return jsonify({"msg": "Password changed successfully"}), 200


@auth.route('/delete', methods=['DELETE'])
@jwt_required() 
def delete():
    user_id=int(get_jwt_identity())
    user=User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Account deleted successfully"}), 200