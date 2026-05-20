import cv2
import numpy as np
from PIL import Image
import os, uuid

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"

def process_image(file_storage):
    #  Save uploaded file
    ext = os.path.splitext(file_storage.filename)[1].lower()
    uid = uuid.uuid4().hex
    input_path = os.path.join(UPLOAD_FOLDER, f"{uid}_input{ext}")
    file_storage.save(input_path)

    # Read with OpenCV
    img = cv2.imread(input_path)
    if img is None:
        raise ValueError("Could not read image. Upload a valid JPG/PNG.")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Canny edge detection
    canny_edges = cv2.Canny(gray, 100, 150)
    g_canny = cv2.add(img, cv2.merge([canny_edges] * 3))
    g_canny = np.clip(g_canny, 0, 255).astype(np.uint8)

    # Marr-Hildreth edge detection
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    marr_edges = cv2.convertScaleAbs(np.absolute(laplacian))
    g_marr = cv2.add(img, cv2.merge([marr_edges] * 3))
    g_marr = np.clip(g_marr, 0, 255).astype(np.uint8)

    # Save results
    paths = {
        "original":       input_path,
        "canny_edges":    os.path.join(RESULT_FOLDER, f"{uid}_canny_edges.png"),
        "canny_output":   os.path.join(RESULT_FOLDER, f"{uid}_canny_output.png"),
        "marr_edges":     os.path.join(RESULT_FOLDER, f"{uid}_marr_edges.png"),
        "marr_output":    os.path.join(RESULT_FOLDER, f"{uid}_marr_output.png"),
    }

    cv2.imwrite(paths["canny_edges"],  canny_edges)
    cv2.imwrite(paths["canny_output"], g_canny)
    cv2.imwrite(paths["marr_edges"],   marr_edges)
    cv2.imwrite(paths["marr_output"],  g_marr)

    return paths