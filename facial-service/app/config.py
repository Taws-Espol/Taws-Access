import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Configuración del servicio, leída de variables de entorno (.env)."""

    port: int = int(os.getenv("PORT", "8000"))
    model_name: str = os.getenv("FACIAL_MODEL_NAME", "Facenet512")
    match_threshold: float = float(os.getenv("FACIAL_MATCH_THRESHOLD", "0.6"))


settings = Settings()