from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from auth_routes import auth_bp
from edge_processor import process_image
import os
import re

load_dotenv()

app = Flask(__name__)

# CORS
CORS(app, origins=[
    "http://localhost:5173",
    "https://edge-detection-app-rosy.vercel.app",
    "https://edge-detection-app-git-main-ayan-ansaris-projects-37f8a565.vercel.app",
    re.compile(r"https://.*\.vercel\.app"),
])

# Config
app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "45ef95ed83380afe50e42ef8eb6307ee3c17004eb659cacf91c42e78b52a2475"
)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

jwt = JWTManager(app)

# Blueprint — with /api prefix
app.register_blueprint(auth_bp, url_prefix="/api")

# Folders
UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Routes
@app.route("/")
def home():
    return jsonify({"message": "Edge Detection Backend Running"})
@app.route("/api/test")
def test():
    try:
        import cv2
        import numpy as np
        return jsonify({"cv2": cv2.__version__, "numpy": np.__version__, "status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/process", methods=["POST"])
@jwt_required()
def process():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file. Upload JPG or PNG."}), 400

    try:
        paths = process_image(file)
        return jsonify({
            "original":     os.path.basename(paths["original"]),
            "canny_edges":  os.path.basename(paths["canny_edges"]),
            "canny_output": os.path.basename(paths["canny_output"]),
            "marr_edges":   os.path.basename(paths["marr_edges"]),
            "marr_output":  os.path.basename(paths["marr_output"]),
        }), 200
    except Exception as e:
        import traceback
        print("PROCESSING ERROR:", traceback.format_exc())
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


@app.route("/api/image/<folder>/<filename>")
@jwt_required()
def serve_image(folder, filename):
    base = RESULT_FOLDER if folder == "results" else UPLOAD_FOLDER
    path = os.path.join(base, filename)
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404
    return send_file(path)


@app.route("/api/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user})



# Run
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)