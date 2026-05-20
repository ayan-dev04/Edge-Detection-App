from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from auth_routes import auth_bp
from edge_processor import process_image
import os

load_dotenv()
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])   # Vite dev server

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024   # 16 MB max upload

jwt = JWTManager(app)

# Register auth routes
app.register_blueprint(auth_bp, url_prefix="/api")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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
        # Return relative filenames so frontend can fetch them
        return jsonify({
            "original":     os.path.basename(paths["original"]),
            "canny_edges":  os.path.basename(paths["canny_edges"]),
            "canny_output": os.path.basename(paths["canny_output"]),
            "marr_edges":   os.path.basename(paths["marr_edges"]),
            "marr_output":  os.path.basename(paths["marr_output"]),
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/image/<folder>/<filename>")
@jwt_required()
def serve_image(folder, filename):
    """Serve a result or upload image."""
    base = "results" if folder == "results" else "uploads"
    path = os.path.join(base, filename)
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404
    return send_file(path)

if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("results", exist_ok=True)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)