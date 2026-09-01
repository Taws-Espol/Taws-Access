import logging
from typing import List, Optional

import numpy as np

from .errors import InvalidEmbeddingError
from .schemas import Candidate, MatchCandidateResult

logger = logging.getLogger(__name__)


def cosine_similarity(a: List[float], b: List[float]) -> float:
    va, vb = np.array(a, dtype=float), np.array(b, dtype=float)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def _is_valid_embedding(values: List[float]) -> bool:
    arr = np.array(values, dtype=float)
    return bool(np.all(np.isfinite(arr)))


def find_best_match(
    embedding: List[float],
    candidates: List[Candidate],
    threshold: float,
) -> Optional[MatchCandidateResult]:
    """
    Compara `embedding` contra cada candidato con similitud coseno y devuelve
    el de mayor score, siempre que supere o iguale `threshold` (RF-BIO-02).
    Si ningún candidato lo alcanza, devuelve None.

    Candidatos con embedding de dimensión distinta o con valores NaN/Inf se
    descartan (y se loguean) en vez de abortar la comparación contra el resto.
    """
    if not _is_valid_embedding(embedding):
        raise InvalidEmbeddingError(
            "El embedding a comparar contiene valores NaN o infinitos."
        )

    best: Optional[MatchCandidateResult] = None
    for candidate in candidates:
        if len(candidate.embedding) != len(embedding):
            logger.warning(
                "Candidato '%s' descartado: dimensión de embedding distinta "
                "(%d vs %d esperado).",
                candidate.id,
                len(candidate.embedding),
                len(embedding),
            )
            continue

        if not _is_valid_embedding(candidate.embedding):
            logger.warning(
                "Candidato '%s' descartado: embedding con valores NaN o "
                "infinitos.",
                candidate.id,
            )
            continue

        score = cosine_similarity(embedding, candidate.embedding)
        if best is None or score > best.score:
            best = MatchCandidateResult(id=candidate.id, score=score)

    if best is None or best.score < threshold:
        return None

    return best
