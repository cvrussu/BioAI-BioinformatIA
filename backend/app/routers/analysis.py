"""Endpoints for sequence analysis and BLAST searches."""

from __future__ import annotations

import asyncio
import logging
from functools import partial

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    AminoAcidComposition,
    BlastRequest,
    BlastResponse,
    PrimerDesignRequest,
    SequenceAnalysisRequest,
    SequenceAnalysisResponse,
)
from app.services import sequence as seq_service
from app.services import primer_design

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["Análisis de secuencias"])


@router.post(
    "/sequence",
    response_model=SequenceAnalysisResponse,
    summary="Análisis fisicoquímico de secuencia",
    description=(
        "Calcula peso molecular, punto isoeléctrico, hidrofobicidad (GRAVY), "
        "aromaticidad, índice de inestabilidad y composición de aminoácidos."
    ),
)
async def analyse_sequence(body: SequenceAnalysisRequest):
    try:
        result = seq_service.analyse(body.sequence)
    except Exception as exc:
        logger.exception("Sequence analysis error")
        raise HTTPException(status_code=422, detail=f"Error en el análisis: {exc}")

    return SequenceAnalysisResponse(
        sequence=result["sequence"],
        length=result["length"],
        molecular_weight=result["molecular_weight"],
        isoelectric_point=result["isoelectric_point"],
        gravy=result["gravy"],
        aromaticity=result["aromaticity"],
        instability_index=result["instability_index"],
        composition=AminoAcidComposition(
            counts=result["composition"]["counts"],
            percentages=result["composition"]["percentages"],
        ),
    )


@router.post(
    "/blast-search",
    response_model=BlastResponse,
    summary="Búsqueda BLAST en NCBI",
    description=(
        "Envía la secuencia a NCBI BLAST (qblast) y retorna los mejores hits. "
        "ADVERTENCIA: esta operación puede tardar de 30 segundos a varios minutos "
        "dependiendo de la carga de NCBI."
    ),
)
async def blast_search(body: BlastRequest):
    try:
        # qblast is blocking I/O — run it in a thread pool to avoid
        # starving the event loop.
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            None,
            partial(
                seq_service.run_blast,
                sequence=body.sequence,
                program=body.program,
                database=body.database,
                evalue=body.evalue,
                max_hits=body.max_hits,
            ),
        )
    except Exception as exc:
        logger.exception("BLAST search error")
        raise HTTPException(
            status_code=502,
            detail=f"Error en la búsqueda BLAST: {exc}",
        )

    return BlastResponse(**result)


@router.post(
    "/primer-design",
    summary="Diseño de primers PCR",
    description=(
        "Diseña primers PCR usando Primer3 para una secuencia de ADN dada. "
        "Retorna hasta 5 pares de primers con Tm, GC% y tamaño del producto."
    ),
)
async def design_primers_endpoint(body: PrimerDesignRequest):
    try:
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            None,
            partial(
                primer_design.design_primers,
                sequence=body.sequence,
                target_start=body.target_start,
                target_length=body.target_length,
                num_return=body.num_return,
                opt_size=body.opt_size,
                opt_tm=body.opt_tm,
            ),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Primer design error")
        raise HTTPException(status_code=502, detail=f"Error en diseño de primers: {exc}")

    return result
