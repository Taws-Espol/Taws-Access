from typing import List, Optional

import numpy as np

from .errors import InvalidEmbeddingError
from .schemas import Candidate, MatchCandidateResult


def cosine_similarity(a: List[float], b: List[float]) -> float:
    va, vb = np.array(a, dtype=float), np.array(b, dtype=float)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def find_best_match(
    embedding: List[float],
    candidates: List[Candidate],
    threshold: float,
) -> Optional[MatchCandidateResult]:
    """
    Compara `embedding` contra cada candidato con similitud coseno y devuelve
    el de mayor score, siempre que supere `threshold` (RF-BIO-02). Si ningún
    candidato lo supera, devuelve None.
    """
    best: Optional[MatchCandidateResult] = None
    for candidate in candidates:
        if len(candidate.embedding) != len(embedding):
            raise InvalidEmbeddingError(
                f"El embedding del candidato '{candidate.id}' tiene una "
                "dimensión distinta al embedding a comparar."
            )

        score = cosine_similarity(embedding, candidate.embedding)
        if best is None or score > best.score:
            best = MatchCandidateResult(id=candidate.id, score=score)

    if best is None or best.score < threshold:
        return None

    return best
