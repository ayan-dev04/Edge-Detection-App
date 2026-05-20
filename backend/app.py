print("STEP 1")

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from .auth_routes import auth_bp
from .edge_processor import process_image
import os

print("STEP 2")

app = Flask(__name__)

print("STEP 3")

CORS(app, origins=["http://localhost:5173"])

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "45ef95ed83380afe50e42ef8eb6307ee3c17004eb659cacf91c42e78b52a2475"
)

jwt = JWTManager(app)

print("STEP 4")

app.register_blueprint(auth_bp)

print("STEP 5")