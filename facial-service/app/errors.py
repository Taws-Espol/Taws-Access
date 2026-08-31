class FacialServiceError(Exception):
    """Error base del dominio de reconocimiento facial."""


class InvalidImageError(FacialServiceError):
    """La imagen recibida no pudo decodificarse."""


class EmbeddingGenerationError(FacialServiceError):
    """DeepFace no pudo generar el embedding facial."""


class InvalidEmbeddingError(FacialServiceError):
    """Un embedding recibido tiene un formato o dimensión inválida."""
