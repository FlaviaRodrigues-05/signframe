from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
import numpy as np

from PIL import Image
import io
import os
import requests

# ============================================================
# APP SETUP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "GRU_for_signframe",
    "signframe_gru_best.keras"
)


# ============================================================
# LOAD GRU MODEL
# ============================================================

print("Loading GRU model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("GRU model loaded successfully!")


# ============================================================
# LOAD MOBILENETV2
# ============================================================

print("Loading MobileNetV2...")

feature_extractor = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

feature_extractor.trainable = False

print("MobileNetV2 loaded successfully!")


# ============================================================
# WLASL 100 CLASSES
# ============================================================

CLASS_NAMES = [
    "accident",
    "africa",
    "all",
    "apple",
    "basketball",
    "bed",
    "before",
    "bird",
    "birthday",
    "black",
    "blue",
    "book",
    "bowling",
    "brown",
    "but",
    "can",
    "candy",
    "chair",
    "change",
    "cheat",
    "city",
    "clothes",
    "color",
    "computer",
    "cook",
    "cool",
    "corn",
    "cousin",
    "cow",
    "dance",
    "dark",
    "deaf",
    "decide",
    "doctor",
    "dog",
    "drink",
    "eat",
    "enjoy",
    "family",
    "fine",
    "finish",
    "fish",
    "forget",
    "full",
    "give",
    "go",
    "graduate",
    "hat",
    "hearing",
    "help",
    "hot",
    "how",
    "jacket",
    "kiss",
    "language",
    "last",
    "later",
    "letter",
    "like",
    "man",
    "many",
    "medicine",
    "meet",
    "mother",
    "need",
    "no",
    "now",
    "orange",
    "paint",
    "paper",
    "pink",
    "pizza",
    "play",
    "pull",
    "purple",
    "right",
    "same",
    "school",
    "secretary",
    "shirt",
    "short",
    "son",
    "study",
    "table",
    "tall",
    "tell",
    "thanksgiving",
    "thin",
    "thursday",
    "time",
    "walk",
    "want",
    "what",
    "white",
    "who",
    "woman",
    "work",
    "wrong",
    "year",
    "yes"
]


# ============================================================
# HOME / HEALTH CHECK
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "SignFrame backend running",
        "model": "MobileNetV2 + GRU",
        "classes": len(CLASS_NAMES)
    })

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

        print(
            "WLASL API status:",
            response.status_code
        )

        if response.status_code != 200:

            return jsonify({
                "error": "Could not load WLASL dataset",
                "status": response.status_code
            }), response.status_code


        items = response.json()

        words_by_folder = {}


        for item in items:

            path = item.get(
                "path",
                ""
            ).strip("/")


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


        words = list(
            words_by_folder.values()
        )


        words.sort(
            key=lambda item:
            item["word"].lower()
        )


        print(
            "WLASL words loaded:",
            len(words)
        )


        return jsonify(words)


    except requests.RequestException as error:

        print(
            "WLASL API error:",
            error
        )


        return jsonify({

            "error":
                "Could not connect to Hugging Face",

            "details":
                str(error)

        }), 502


# ============================================================
# WLASL VIDEO PROXY
# ============================================================

@app.route(
    "/wlasl/<path:video_path>",
    methods=["GET"]
)
def wlasl_video(video_path):

    if ".." in video_path:

        return jsonify({
            "error": "Invalid video path"
        }), 400


    if not video_path.lower().endswith(".mp4"):

        return jsonify({
            "error": "Complete MP4 path required"
        }), 400


    hf_url = (
        f"{HF_RESOLVE}/{video_path}"
    )


    print()
    print(
        "Fetching WLASL video:"
    )
    print(hf_url)
    print()


    try:

        headers = {}


        # Forward browser range request
        if request.headers.get("Range"):

            headers["Range"] = (
                request.headers["Range"]
            )


        response = requests.get(
            hf_url,
            stream=True,
            timeout=60,
            headers=headers
        )


        if response.status_code not in (
            200,
            206
        ):

            return jsonify({

                "error":
                    "Could not fetch WLASL video",

                "status":
                    response.status_code

            }), response.status_code


        content_type = (
            response.headers.get(
                "Content-Type",
                "video/mp4"
            )
        )


        response_headers = {

            "Content-Type":
                content_type,

            "Accept-Ranges":
                "bytes"

        }


        if response.headers.get(
            "Content-Length"
        ):

            response_headers[
                "Content-Length"
            ] = response.headers[
                "Content-Length"
            ]


        if response.headers.get(
            "Content-Range"
        ):

            response_headers[
                "Content-Range"
            ] = response.headers[
                "Content-Range"
            ]


        return Response(
            response.iter_content(
                chunk_size=1024 * 64
            ),
            status=response.status_code,
            headers=response_headers
        )


    except requests.RequestException as error:

        print(
            "WLASL video error:",
            error
        )


        return jsonify({

            "error":
                "Could not fetch WLASL video",

            "details":
                str(error)

        }), 502
# ============================================================
# PREDICT
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    # --------------------------------------------------------
    # Check frames
    # --------------------------------------------------------

    if "frames" not in request.files:

        return jsonify({
            "success": False,
            "error": "No frames received."
        }), 400


    files = request.files.getlist("frames")


    # --------------------------------------------------------
    # We need exactly 16 frames
    # --------------------------------------------------------

    if len(files) != 16:

        return jsonify({
            "success": False,
            "error": (
                f"Expected 16 frames, "
                f"but received {len(files)}."
            )
        }), 400


    try:

        frames = []


        # ----------------------------------------------------
        # PROCESS EACH FRAME
        # ----------------------------------------------------

        for file in files:

            image = Image.open(
                io.BytesIO(
                    file.read()
                )
            ).convert("RGB")


            image = image.resize(
                (224, 224)
            )


            image = np.array(
                image,
                dtype=np.float32
            )


            # MobileNetV2 preprocessing
            image = tf.keras.applications.mobilenet_v2.preprocess_input(
                image
            )


            frames.append(image)


        # ----------------------------------------------------
        # Convert to NumPy
        #
        # (16, 224, 224, 3)
        # ----------------------------------------------------

        frames = np.array(frames)


        print(
            "Received frames:",
            frames.shape
        )


        # ----------------------------------------------------
        # MOBILENETV2 FEATURE EXTRACTION
        #
        # (16, 224, 224, 3)
        #              ↓
        # (16, 1280)
        # ----------------------------------------------------

        features = feature_extractor.predict(
            frames,
            verbose=0
        )


        print(
            "Extracted features:",
            features.shape
        )


        # ----------------------------------------------------
        # CHECK FEATURE SHAPE
        # ----------------------------------------------------

        if features.shape != (16, 1280):

            return jsonify({
                "success": False,
                "error": (
                    "Unexpected feature shape: "
                    f"{features.shape}"
                )
            }), 500


        # ----------------------------------------------------
        # ADD BATCH DIMENSION
        #
        # (16, 1280)
        #      ↓
        # (1, 16, 1280)
        # ----------------------------------------------------

        features = np.expand_dims(
            features,
            axis=0
        )


        print(
            "GRU input shape:",
            features.shape
        )


        # ----------------------------------------------------
        # GRU PREDICTION
        # ----------------------------------------------------

        prediction = model.predict(
            features,
            verbose=0
        )


        probabilities = prediction[0]


        # ----------------------------------------------------
        # TOP 5 PREDICTIONS
        # ----------------------------------------------------

        top_indices = np.argsort(
            probabilities
        )[::-1][:5]


        top_predictions = []


        for index in top_indices:

            top_predictions.append({

                "word": CLASS_NAMES[
                    int(index)
                ],

                "class_id": int(index),

                "confidence": round(
                    float(
                        probabilities[index]
                    ),
                    4
                )

            })


        # ----------------------------------------------------
        # BEST PREDICTION
        # ----------------------------------------------------

        predicted_id = int(
            np.argmax(
                probabilities
            )
        )


        confidence = float(
            probabilities[
                predicted_id
            ]
        )


        word = CLASS_NAMES[
            predicted_id
        ]


        # ----------------------------------------------------
        # PRINT RESULT
        # ----------------------------------------------------

        print("")
        print("==============================")
        print("GRU PREDICTION")
        print("==============================")


        for item in top_predictions:

            print(
                f"{item['word']}: "
                f"{item['confidence'] * 100:.2f}%"
            )


        print("==============================")
        print("")


        # ----------------------------------------------------
        # SEND RESULT TO REACT
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "word": word,

            "class_id": predicted_id,

            "confidence": round(
                confidence,
                4
            ),

            "top_predictions": top_predictions

        })


    except Exception as e:

        print(
            "Prediction error:",
            str(e)
        )


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )