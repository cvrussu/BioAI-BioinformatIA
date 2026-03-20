"""Endpoint for AI-powered interpretation of bioinformatics results."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import InterpretRequest, InterpretResponse
from app.services import ai_interpreter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Interpretación AI"])


@router.post(
    "/interpret",
    response_model=InterpretResponse,
    summary="Interpretar resultados con IA",
    description=(
        "Recibe resultados de análisis bioinformáticos y genera una interpretación "
        "clara en español usando Claude, contextualizada para la industria del usuario."
    ),
)
async def interpret_results(body: InterpretRequest):
    try:
        result = await ai_interpreter.interpret(
            results=body.results,
            context=body.context,
            industry=body.industry.value,
        )
    except Exception as exc:
        logger.exception("AI interpretation error")
        raise HTTPException(
            status_code=502,
            detail=f"Error al generar la interpretación: {exc}",
        )

    return InterpretResponse(**result)
