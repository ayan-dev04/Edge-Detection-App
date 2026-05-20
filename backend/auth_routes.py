from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt, json, os

auth_bp = Blueprint("auth", __name__)
USERS_FILE = "users.json"   # simple file-based "database"

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name     = data.get("name", "").strip()

    if not email or not password or not name:
        return jsonify({"error": "All fields required"}), 400

    users = load_users()
    if email in users:
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users[email] = {"name": name, "password": hashed}
    save_users(users)

    token = create_access_token(identity=email)
    return jsonify({"token": token, "name": name, "email": email}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    users = load_users()
    user  = users.get(email)
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=email)
    return jsonify({"token": token, "name": user["name"], "email": email}), 200