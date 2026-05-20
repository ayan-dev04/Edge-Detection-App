from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from .auth_routes import auth_bp
from .edge_processor import process_image
import os

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Enable CORS for frontend
CORS(app, origins=["http://localhost:5173"])

# App configuration
app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "45ef95ed83380afe50e42ef8eb6307ee3c17004eb659cacf91c42e78b52a2475"
)

app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload limit

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)

# Upload folder
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return jsonify({
        "message": "Edge Detection Backend Running"
    })


@app.route("/process", methods=["POST"])
@jwt_required()
def process():

    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "error": "Empty filename"
        }), 400

    try:
        # Save uploaded image
        input_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(input_path)

        # Process image
        output_filename = f"processed_{file.filename}"
        output_path = os.path.join(PROCESSED_FOLDER, output_filename)

        process_image(input_path, output_path)

        return send_file(
            output_path,
            mimetype="image/png"
        )

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():

    current_user = get_jwt_identity()

    return jsonify({
        "logged_in_as": current_user
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )