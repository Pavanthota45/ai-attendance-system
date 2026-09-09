from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import face_recognition
import numpy as np
from PIL import Image

import io
import json


app = FastAPI(
    title="AI Attendance Service",
    description="AI service for face recognition attendance",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "success": True,
        "message": "AI Attendance Service is running!"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "message": "AI service is healthy"
    }


# =========================================================
# GENERATE FACE ENCODING
# =========================================================

@app.post("/encode-face")
async def encode_face(file: UploadFile = File(...)):
    try:

        # Read uploaded image
        image_bytes = await file.read()

        # Convert image to PIL image
        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        # Convert image to NumPy array
        image_array = np.array(image)

        # Detect faces
        face_locations = face_recognition.face_locations(
            image_array
        )

        # No face
        if len(face_locations) == 0:
            return {
                "success": False,
                "message": "No face detected in the image"
            }

        # More than one face
        if len(face_locations) > 1:
            return {
                "success": False,
                "message": (
                    "Multiple faces detected. "
                    "Please upload an image containing "
                    "only one face."
                )
            }

        # Generate encoding
        face_encodings = face_recognition.face_encodings(
            image_array,
            face_locations
        )

        if len(face_encodings) == 0:
            return {
                "success": False,
                "message": "Unable to generate face encoding"
            }

        encoding = face_encodings[0]

        return {
            "success": True,
            "message": "Face encoding generated successfully",
            "encoding": encoding.tolist()
        }

    except Exception as error:

        print(
            "Face encoding error:",
            error
        )

        return {
            "success": False,
            "message": "Error processing the image"
        }


# =========================================================
# RECOGNIZE FACE
# =========================================================

@app.post("/recognize-face")
async def recognize_face(file: UploadFile = File(...)):
    try:

        # -----------------------------------------------------
        # Read uploaded image
        # -----------------------------------------------------

        image_bytes = await file.read()

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        image_array = np.array(image)


        # -----------------------------------------------------
        # Detect faces
        # -----------------------------------------------------

        face_locations = face_recognition.face_locations(
            image_array
        )


        # -----------------------------------------------------
        # Check number of faces
        # -----------------------------------------------------

        if len(face_locations) == 0:
            return {
                "success": False,
                "recognized": False,
                "message": "No face detected"
            }

        if len(face_locations) > 1:
            return {
                "success": False,
                "recognized": False,
                "message": "Multiple faces detected"
            }


        # -----------------------------------------------------
        # Generate encoding for camera image
        # -----------------------------------------------------

        face_encodings = face_recognition.face_encodings(
            image_array,
            face_locations
        )

        if len(face_encodings) == 0:
            return {
                "success": False,
                "recognized": False,
                "message": "Unable to generate face encoding"
            }


        current_encoding = face_encodings[0]


        # -----------------------------------------------------
        # Return encoding to backend
        #
        # The Node.js backend will compare this encoding
        # with the registered student encodings.
        # -----------------------------------------------------

        return {
            "success": True,
            "recognized": False,
            "message": "Face encoding generated successfully",
            "encoding": current_encoding.tolist()
        }


    except Exception as error:

        print(
            "Face recognition error:",
            error
        )

        return {
            "success": False,
            "recognized": False,
            "message": "Error processing the image"
        }