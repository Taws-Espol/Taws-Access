import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .config import settings
from .embeddings import generate_embedding
from .errors import EmbeddingGenerationError, FacialServiceError, InvalidImageError
from .matching import find_best_match
from .schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    MatchRequest,
    MatchResponse,
)

logger = logging.getLogger("facial-service")

app = FastAPI(
    title="SERGI — Facial Service",
    description="Microservicio de reconocimiento facial (DeepFace) para SERGI.",
    version="0.1.0",
)


@app.exception_handler(InvalidImageError)
async def handle_invalid_image(_request: Request, exc: InvalidImageError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(EmbeddingGenerationError)
async def handle_embedding_generation_error(
    _request: Request, exc: EmbeddingGenerationError
) -> JSONResponse:
    logger.exception("Error generando el embedding facial", exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.exception_handler(FacialServiceError)
async def handle_facial_service_error(_request: Request, exc: FacialServiceError) -> JSONResponse:
    logger.exception("Error del servicio de reconocimiento facial", exc_info=exc)
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": settings.model_name}


@app.post("/embeddings", response_model=EmbeddingResponse)
def create_embedding(request: EmbeddingRequest) -> EmbeddingResponse:
    embedding = generate_embedding(request.image_base64)
    return EmbeddingResponse(embedding=embedding, model=settings.model_name)


@app.post("/match", response_model=MatchResponse)
def match_embedding(request: MatchRequest) -> MatchResponse:
    threshold = (
        request.threshold if request.threshold is not None else settings.match_threshold
    )
    best_match = find_best_match(request.embedding, request.candidates, threshold)
    return MatchResponse(match=best_match, threshold=threshold)
