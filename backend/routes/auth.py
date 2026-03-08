from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, jwt_required, get_jwt_identity
from models import TokenBlocklist, User, db
from utils.api_response import api_response



# ---------------- AUTH ROUTES ----------------
# Roles : auperadmin, admin, User


auth = Blueprint('auth', __name__, url_prefix='/auth')

from functools import wraps

def admin_required():
    def wrapper(fn):

        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):

            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                return api_response(404, "User not found")

            if user.status != "active":
                return api_response(403, "Account suspended")

            if user.role not in ["admin", "superadmin"]:
                return api_response(403, "Admin or Superadmin access required")

            return fn(*args, **kwargs)

        return decorator

    return wrapper




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

# ---------------- VERIFY TOKEN ----------------
@auth.route("/verify", methods=["POST"])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()

        return jsonify({
            "success": True,
            "message": "Token valid",
            "user_id": user_id
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Token expired or invalid"
        }), 401


@auth.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():

    try:
        identity = get_jwt_identity()

        new_access_token = create_access_token(identity=identity)

        return jsonify({
            "success": True,
            "access_token": new_access_token
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Refresh token invalid or expired"
        }), 401

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

# only Admin can access this route

@auth.route('/delete/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    user = User.query.get_or_404(user_id)

    # Prevent admin deleting superadmin
    if user.role == "superadmin" and current_user.role != "superadmin":
        return api_response(
            status_code=403,
            message="Only superadmin can delete a superadmin"
        )

    db.session.delete(user)
    db.session.commit()

    return api_response(
        status_code=200,
        message="User deleted successfully"
    )



@auth.route('/admin/create', methods=['POST'])
@admin_required()
def create_admin():

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    data = request.get_json()

    if not data or not all(k in data for k in ("email", "password", "name")):
        return api_response(status_code=400, message="Missing required fields")

    if User.query.filter_by(email=data['email']).first():
        return api_response(status_code=409, message="User already exists")

    # flag to determine role
    is_superadmin = data.get("is_superadmin", False)

    # Only superadmin can create another superadmin
    if is_superadmin and current_user.role != "superadmin":
        return api_response(
            status_code=403,
            message="Only superadmin can create superadmin"
        )

    role = "superadmin" if is_superadmin else "admin"

    user = User(
        email=data['email'],
        name=data['name'],
        role=role
    )

    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    return api_response(
        status_code=201,
        message=f"{role.capitalize()} created successfully"
    )

@auth.route('/users', methods=['GET'])
@admin_required()
def get_all_users():

    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    search = request.args.get("search", "", type=str)
    role = request.args.get("role", None, type=str)
    status = request.args.get("status", None, type=str)
    sort = request.args.get("sort", "desc", type=str)

    query = User.query

    # ---------------- SEARCH ----------------
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) |
            (User.name.ilike(f"%{search}%"))
        )

    # ---------------- ROLE FILTER ----------------
    if role:
        query = query.filter(User.role == role)

    # ---------------- STATUS FILTER ----------------
    if status:
        query = query.filter(User.status == status)

    # ---------------- SORT ----------------
    if sort == "asc":
        query = query.order_by(User.created_at.asc())
    else:
        query = query.order_by(User.created_at.desc())

    # ---------------- PAGINATION ----------------
    pagination = query.paginate(page=page, per_page=limit, error_out=False)

    users = pagination.items

    user_list = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "created_at": user.created_at
        }
        for user in users
    ]

    return api_response(
        status_code=200,
        message="Users fetched successfully",
        data={
            "users": user_list,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }
    )

@auth.route('/users/<int:user_id>/status', methods=['PATCH'])
@admin_required()
def update_user_status(user_id):

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    user = User.query.get_or_404(user_id)

    data = request.get_json()
    status = data.get("status")

    if status not in ["active", "suspended"]:
        return api_response(
            status_code=400,
            message="Status must be 'active' or 'suspended'"
        )

    # Admin cannot suspend superadmin
    if user.role == "superadmin" and current_user.role != "superadmin":
        return api_response(
            status_code=403,
            message="Only superadmin can suspend superadmin"
        )

    user.status = status

    db.session.commit()

    return api_response(
        status_code=200,
        message=f"User {status} successfully"
    )    