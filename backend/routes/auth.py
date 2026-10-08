from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import Blueprint, current_app, jsonify, request
from jwt.exceptions import InvalidTokenError
from sqlalchemy.exc import IntegrityError

from models import User, db
from utils.validators import validate_login, validate_registration

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


def error_response(message, status_code, **data):
    return jsonify(success=False, message=message, **data), status_code


def token_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        authorization = request.headers.get("Authorization", "")
        scheme, separator, token = authorization.partition(" ")
        if not separator or scheme.lower() != "bearer" or not token.strip():
            return error_response("Authorization token is required.", 401)

        try:
            claims = jwt.decode(
                token.strip(),
                current_app.config["JWT_SECRET_KEY"],
                algorithms=[current_app.config["JWT_ALGORITHM"]],
            )
            user_id = int(claims["sub"])
        except (InvalidTokenError, KeyError, TypeError, ValueError):
            return error_response("Invalid or expired authorization token.", 401)

        user = db.session.get(User, user_id)
        if user is None:
            return error_response("Invalid or expired authorization token.", 401)
        return view(user, *args, **kwargs)

    return wrapped


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error_response("Request body must be a JSON object.", 400)

    errors = validate_registration(data)
    if errors:
        return error_response("Validation failed.", 400, errors=errors)

    full_name = data.get("fullName", data.get("name"))
    email = data["email"].strip().lower()
    if User.query.filter_by(email=email).first() is not None:
        return error_response("An account with this email already exists.", 409)

    user = User(
        full_name=full_name.strip(),
        email=email,
        phone=data["phone"].strip(),
    )
    user.set_password(data["password"])

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("An account with this email already exists.", 409)

    return jsonify(success=True, message="Your account has been created."), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error_response("Request body must be a JSON object.", 400)

    errors = validate_login(data)
    if errors:
        return error_response("Validation failed.", 400, errors=errors)

    user = User.query.filter_by(email=data["email"].strip().lower()).first()
    if user is None or not user.check_password(data["password"]):
        return error_response("Invalid email or password", 401)

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=current_app.config["JWT_EXPIRES_MINUTES"]
    )
    token = jwt.encode(
        {"sub": str(user.id), "iat": datetime.now(timezone.utc), "exp": expires_at},
        current_app.config["JWT_SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )
    return jsonify(
        success=True,
        message="You’re logged in.",
        token=token,
        user={"fullName": user.full_name, "email": user.email},
    ), 200


@auth_bp.get("/me")
@token_required
def me(user):
    return jsonify(
        success=True,
        message="Profile retrieved.",
        user={
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "createdAt": user.created_at.isoformat(),
        },
    ), 200
