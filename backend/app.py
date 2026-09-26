from flask import Flask, request, jsonify, Response
from flask_cors import CORS

import tensorflow as tf
import numpy as np
from PIL import Image

import io
import os
import json
import base64
import requests


app = Flask(__name__)
CORS(app)


# ============================================================
# HUGGING FACE
# ============================================================

HF_DATASET = (
    "https://huggingface.co/datasets/"
    "chris0202/wlasl100-signframe"
)

HF_RESOLVE = (
    "https://huggingface.co/datasets/"
    "chris0202/wlasl100-signframe/resolve/main"
)


# ============================================================
# GET WLASL WORDS
# ============================================================

@app.route("/wlasl/words", methods=["GET"])
def get_wlasl_words():

    api_url = (
        "https://huggingface.co/api/datasets/"
        "chris0202/wlasl100-signframe/tree/main"
        "?recursive=true&expand=false"
    )

    try:
        response = requests.get(
            api_url,
            timeout=60,
            headers={
                "Accept": "application/json"
            }
        )

        print("WLASL API status:", response.status_code)

        if response.status_code != 200:
            return jsonify({
                "error": "Could not load WLASL dataset",
                "status": response.status_code
            }), response.status_code

        items = response.json()

        words_by_folder = {}

        for item in items:

            path = item.get("path", "").strip("/")

            if not path.lower().endswith(".mp4"):
                continue

            parts = path.split("/")

            if len(parts) < 2:
                continue

            folder = parts[-2].strip()
            filename = parts[-1]

            if not folder:
                continue

            if folder.lower() == "all":
                continue

            key = folder.lower()

            if key not in words_by_folder:

                words_by_folder[key] = {
                    "file": filename,
                    "folder": folder,
                    "source": "wlasl",
                    "word": folder
                }

        words = list(words_by_folder.values())

        words.sort(
            key=lambda item: item["word"].lower()
        )

        print("WLASL words loaded:", len(words))

        return jsonify(words)

    except requests.RequestException as error:

        print("WLASL API error:", error)

        return jsonify({
            "error": "Could not connect to Hugging Face",
            "details": str(error)
        }), 502


# ============================================================
# WLASL VIDEO PROXY
# ============================================================

@app.route("/wlasl/<path:video_path>", methods=["GET"])
def wlasl_video(video_path):

    if ".." in video_path:
        return jsonify({
            "error": "Invalid video path"
        }), 400

    if not video_path.lower().endswith(".mp4"):
        return jsonify({
            "error": "Complete MP4 path required"
        }), 400

    hf_url = f"{HF_RESOLVE}/{video_path}"

    print()
    print("====================================")
    print("Fetching WLASL video:")
    print(hf_url)
    print("====================================")

    try:

        headers = {}

        # Forward browser range request
        if request.headers.get("Range"):
            headers["Range"] = request.headers["Range"]

        response = requests.get(
            hf_url,
            stream=True,
            timeout=60,
            headers=headers,
            allow_redirects=True
        )

        print(
            "Hugging Face status:",
            response.status_code
        )

        if response.status_code not in (200, 206):

            return jsonify({
                "error": "Hugging Face video not found",
                "status": response.status_code,
                "url": hf_url
            }), response.status_code

        def generate():

            try:

                for chunk in response.iter_content(
                    chunk_size=1024 * 1024
                ):

                    if chunk:
                        yield chunk

            finally:
                response.close()

        response_headers = {
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600"
        }

        for header in (
            "Content-Length",
            "Content-Range",
            "ETag",
            "Last-Modified"
        ):

            value = response.headers.get(header)

            if value:
                response_headers[header] = value

        return Response(
            generate(),
            status=response.status_code,
            headers=response_headers,
            content_type=response.headers.get(
                "Content-Type",
                "video/mp4"
            )
        )

    except requests.RequestException as error:

        print(
            "Hugging Face video error:",
            error
        )

        return jsonify({
            "error": "Could not connect to Hugging Face",
            "details": str(error)
        }), 502


# ============================================================
# SHARED MOBILENETV2 FEATURE EXTRACTOR
#
# Built once at startup and reused by both the GRU word model
# and the alphabet classifier below, instead of being rebuilt
# on every single request.
# ============================================================

print("Loading shared MobileNetV2 feature extractor...")

mobilenet_feature_extractor = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

print("Shared feature extractor loaded successfully!")


# ============================================================
# GRU MODEL (word-level, 16-frame sequences)
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "GRU_for_signframe",
    "signframe_gru_best.keras"
)

print("Loading GRU model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("GRU model loaded successfully!")


CLASS_NAMES = [
    str(i)
    for i in range(100)
]


# ============================================================
# ALPHABET MODEL (single-frame, MobileNetV2 features + dense classifier)
# ============================================================

ALPHABET_MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "cnn_model_asl-alphabet_dataset",
    "best_signframe_feature_classifier.keras"
)

ALPHABET_CLASSES_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "class_names.json"
)

print("Loading alphabet classifier...")

alphabet_classifier = tf.keras.models.load_model(
    ALPHABET_MODEL_PATH
)

with open(ALPHABET_CLASSES_PATH) as f:
    ALPHABET_CLASS_NAMES = json.load(f)

print("Alphabet classifier loaded successfully!")


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "SignFrame backend running"
    })


# ============================================================
# PREDICT (word-level, GRU model, 16 frames)
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    if "frames" not in request.files:

        return jsonify({
            "error": "No frames received"
        }), 400

    files = request.files.getlist("frames")

    if len(files) != 16:

        return jsonify({
            "error": (
                f"Expected 16 frames, "
                f"received {len(files)}"
            )
        }), 400

    frames = []

    for file in files:

        image = Image.open(
            io.BytesIO(file.read())
        ).convert("RGB")

        image = image.resize((224, 224))

        image = np.array(
            image
        ).astype("float32")

        image = (
            tf.keras.applications
            .mobilenet_v2
            .preprocess_input(image)
        )

        frames.append(image)

    frames = np.array(frames)

    features = mobilenet_feature_extractor.predict(
        frames,
        verbose=0
    )

    features = np.expand_dims(
        features,
        axis=0
    )

    prediction = model.predict(
        features,
        verbose=0
    )

    predicted_id = int(
        np.argmax(prediction[0])
    )

    confidence = float(
        np.max(prediction[0])
    )

    word = CLASS_NAMES[predicted_id]

    return jsonify({
        "word": word,
        "class_id": predicted_id,
        "confidence": confidence
    })


# ============================================================
# PREDICT SIGN (single-frame alphabet check)
# ============================================================

@app.route("/predict-sign", methods=["POST"])
def predict_sign():

    data = request.get_json()

    if not data or "image" not in data:
        return jsonify({
            "error": "No image received"
        }), 400

    expected_label = data.get("expectedLabel")

    try:
        img_b64 = data["image"].split(",")[-1]

        image = Image.open(
            io.BytesIO(base64.b64decode(img_b64))
        ).convert("RGB")

        image = image.resize((224, 224))

        image = np.expand_dims(
            np.array(image).astype("float32"),
            axis=0
        )

        image = tf.keras.applications.mobilenet_v2.preprocess_input(image)

        features = mobilenet_feature_extractor.predict(
            image,
            verbose=0
        )

        prediction = alphabet_classifier.predict(
            features,
            verbose=0
        )[0]

        predicted_id = int(np.argmax(prediction))
        confidence = float(np.max(prediction))
        predicted_label = ALPHABET_CLASS_NAMES[predicted_id]

        is_correct = (
            expected_label is not None
            and predicted_label.upper() == str(expected_label).upper()
        )

        return jsonify({
            "predicted": predicted_label,
            "confidence": confidence,
            "isCorrect": is_correct,
            "score": round(confidence * 100)
        })

    except Exception as error:

        print("Alphabet prediction error:", error)

        return jsonify({
            "error": "Could not process image",
            "details": str(error)
        }), 500


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )