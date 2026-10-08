import re


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_PATTERN = re.compile(r"^[0-9]{10}$")


def validate_registration(data):
    errors = {}
    # The current frontend sends `name`; accept it until its payload is migrated.
    full_name = data.get("fullName", data.get("name"))
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not isinstance(full_name, str) or not full_name.strip():
        errors["fullName"] = "Enter your full name."
    elif len(full_name.strip()) < 3:
        errors["fullName"] = "Your name must be at least 3 characters."

    if not isinstance(email, str) or not email.strip():
        errors["email"] = "Enter your email address."
    elif not EMAIL_PATTERN.fullmatch(email.strip()):
        errors["email"] = "Enter a valid email address."

    if not isinstance(phone, str) or not PHONE_PATTERN.fullmatch(phone.strip()):
        errors["phone"] = "Enter a 10-digit phone number."

    if not isinstance(password, str) or len(password) < 8:
        errors["password"] = "Use at least 8 characters."
    else:
        if not re.search(r"[A-Z]", password):
            errors["password"] = "Include at least one uppercase letter."
        elif not re.search(r"[a-z]", password):
            errors["password"] = "Include at least one lowercase letter."
        elif not re.search(r"[0-9]", password):
            errors["password"] = "Include at least one number."
        elif not re.search(r"[^A-Za-z0-9]", password):
            errors["password"] = "Include at least one special character."

    return errors


def validate_login(data):
    errors = {}
    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not EMAIL_PATTERN.fullmatch(email.strip()):
        errors["email"] = "Enter a valid email address."
    if not isinstance(password, str) or not password:
        errors["password"] = "Enter your password."

    return errors
