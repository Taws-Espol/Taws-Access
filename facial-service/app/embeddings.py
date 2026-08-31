import base64
import io

import numpy as np
from deepface import DeepFace
from PIL import Image

from .config import settings
from .errors import EmbeddingGenerationError, InvalidImageError


def decode_image(image_base64: str) -> np.ndarray:
    """Decodifica una imagen en base64 (con o sin prefijo data URL) a un array RGB."""
    if image_base64.strip().startswith("data:") and "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    try:
        raw = base64.b64decode(image_base64, validate=True)
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise InvalidImageError("No se pudo decodificar la imagen enviada.") from exc

    return np.array(image)


def generate_embedding(image_base64: str) -> list[float]:
    """
    Genera el embedding facial de una imagen ya recortada por MediaPipe en el
    cliente.

    RF-BIO-07 / RNF-SEG-04: la imagen solo se decodifica en memoria para este
    cálculo y nunca se persiste en disco.
    """
    image = decode_image(image_base64)

    try:
        # enforce_detection=False: la imagen ya llega recortada al rostro
        # (MediaPipe la procesó en el cliente), no se vuelve a detectar aquí.
        result = DeepFace.represent(
            img_path=image,
            model_name=settings.model_name,
            enforce_detection=False,
        )
    except Exception as exc:
        raise EmbeddingGenerationError(
            "No se pudo generar el embedding facial."
        ) from exc

    if not result or "embedding" not in result[0]:
        raise EmbeddingGenerationError("DeepFace no devolvió un embedding válido.")

    return result[0]["embedding"]
