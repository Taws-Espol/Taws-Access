import os

from dotenv import load_dotenv

load_dotenv()


def _env_int(name: str, default: str) -> int:
    raw = os.getenv(name, default)
    try:
        return int(raw)
    except ValueError as exc:
        raise ValueError(
            f"Variable de entorno '{name}' inválida: se esperaba un entero, "
            f"se recibió '{raw}'."
        ) from exc


def _env_float(name: str, default: str) -> float:
    raw = os.getenv(name, default)
    try:
        return float(raw)
    except ValueError as exc:
        raise ValueError(
            f"Variable de entorno '{name}' inválida: se esperaba un número, "
            f"se recibió '{raw}'."
        ) from exc


class Settings:
    """Configuración del servicio, leída de variables de entorno (.env)."""

    port: int = _env_int("PORT", "8000")
    model_name: str = os.getenv("FACIAL_MODEL_NAME", "Facenet512")
    match_threshold: float = _env_float("FACIAL_MATCH_THRESHOLD", "0.6")


settings = Settings()