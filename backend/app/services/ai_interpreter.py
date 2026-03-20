"""Service layer for AI-powered interpretation of bioinformatics results.

Uses Groq (LLaMA) as primary provider with Anthropic (Claude) as fallback.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import anthropic
from groq import Groq

from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
Eres BioAI, un bioinformatico experto y amigable. Tu trabajo es interpretar
resultados de analisis bioinformaticos y explicarlos en espanol claro y accesible
para profesionales que NO son bioinformaticos.

Reglas:
1. Responde SIEMPRE en espanol.
2. Usa lenguaje tecnico cuando sea necesario, pero explica cada termino.
3. Estructura tu respuesta con secciones claras usando Markdown.
4. Si se proporciona un contexto de industria, relaciona los resultados con
   aplicaciones practicas en esa industria.
5. Incluye una seccion "Resumen ejecutivo" al inicio con los puntos clave.
6. Si los datos son insuficientes para una conclusion firme, dilo claramente.
7. No inventes datos ni referencias; basa tu interpretacion solo en los
   resultados proporcionados.
"""


def _build_user_prompt(
    results: dict[str, Any],
    context: str,
    industry: str,
) -> str:
    parts = [
        "## Resultados del analisis\n",
        "```json",
        json.dumps(results, indent=2, ensure_ascii=False, default=str),
        "```\n",
    ]

    if context:
        parts.append(f"## Contexto adicional del usuario\n{context}\n")

    if industry and industry != "general":
        parts.append(
            f"## Industria del usuario\n"
            f"El usuario trabaja en la industria de **{industry}**. "
            f"Por favor contextualiza la interpretacion para esta industria, "
            f"mencionando posibles aplicaciones, riesgos o relevancia practica.\n"
        )

    parts.append(
        "Por favor proporciona una interpretacion completa de estos resultados."
    )

    return "\n".join(parts)


def _interpret_with_groq(user_prompt: str) -> dict[str, Any]:
    """Synchronous call to Groq API."""
    client = Groq(api_key=settings.groq_api_key)

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        model=settings.groq_model,
        max_tokens=2048,
        temperature=0.3,
    )

    return {
        "interpretation": chat_completion.choices[0].message.content,
        "model_used": settings.groq_model,
        "provider": "groq",
    }


async def _interpret_with_anthropic(user_prompt: str) -> dict[str, Any]:
    """Async fallback call to Anthropic API."""
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    message = await client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return {
        "interpretation": message.content[0].text,
        "model_used": settings.anthropic_model,
        "provider": "anthropic",
    }


async def interpret(
    results: dict[str, Any],
    context: str = "",
    industry: str = "general",
) -> dict[str, Any]:
    """Generate an AI interpretation of analysis results.

    Tries Groq first; falls back to Anthropic if Groq fails or is not
    configured.

    Returns a dict with ``interpretation``, ``industry``, and ``model_used``.
    """
    user_prompt = _build_user_prompt(results, context, industry)

    # --- Primary: Groq ---
    if settings.groq_api_key:
        try:
            logger.info("Requesting interpretation from Groq (%s)", settings.groq_model)
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(
                None, _interpret_with_groq, user_prompt
            )
            result["industry"] = industry
            return result
        except Exception:
            logger.exception(
                "Groq interpretation failed; falling back to Anthropic"
            )

    # --- Fallback: Anthropic ---
    if settings.anthropic_api_key:
        logger.info(
            "Requesting interpretation from Anthropic (%s)", settings.anthropic_model
        )
        result = await _interpret_with_anthropic(user_prompt)
        result["industry"] = industry
        return result

    raise RuntimeError(
        "No AI provider configured. Set GROQ_API_KEY or ANTHROPIC_API_KEY in .env"
    )
