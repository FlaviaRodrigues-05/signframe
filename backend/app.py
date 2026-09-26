from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
import numpy as np

from PIL import Image
import io
import os


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

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )