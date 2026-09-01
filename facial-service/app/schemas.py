from typing import List, Optional

from pydantic import BaseModel, Field


class EmbeddingRequest(BaseModel):
    image_base64: str = Field(
        ...,
        min_length=1,
        description=(
            "Imagen del rostro ya recortada por MediaPipe en el cliente, "
            "codificada en base64 (con o sin prefijo data URL)."
        ),
    )


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    model: str


class Candidate(BaseModel):
    id: str
    embedding: List[float] = Field(..., min_length=1)


class MatchRequest(BaseModel):
    embedding: List[float] = Field(
        ..., min_length=1, description="Embedding a comparar contra los candidatos."
    )
    candidates: List[Candidate] = Field(
        ..., description="Embeddings almacenados contra los que se compara."
    )
    threshold: Optional[float] = Field(
        None,
        ge=-1.0,
        le=1.0,
        description=(
            "Umbral de similitud coseno (-1 a 1). Si se omite, se usa "
            "FACIAL_MATCH_THRESHOLD."
        ),
    )


class MatchCandidateResult(BaseModel):
    id: str
    score: float


class MatchResponse(BaseModel):
    match: Optional[MatchCandidateResult]
    threshold: float
