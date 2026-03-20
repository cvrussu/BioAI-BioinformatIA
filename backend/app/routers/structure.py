"""Endpoints for protein structure prediction and AlphaFold DB lookups.

AlphaFold API docs: https://alphafold.ebi.ac.uk/api-docs
Endpoints used:
  GET /prediction/{qualifier}
  GET /complex/{qualifier}
  GET /annotations/{qualifier}.json?type=MUTAGEN
"""

from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    AlphaFoldAnnotationsResponse,
    AlphaFoldComplexResponse,
    AlphaFoldEntryResponse,
    PredictStructureRequest,
    PredictStructureResponse,
)
from app.services import alphafold_db, esmfold

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/structure", tags=["Estructura de proteinas"])


# ── ESMFold prediction ──────────────────────────────────────────────────

@router.post(
    "/predict",
    response_model=PredictStructureResponse,
    summary="Predecir estructura 3D con ESMFold",
    description=(
        "Envia una secuencia de aminoacidos (max. 400 residuos) al API de ESMFold "
        "y devuelve el contenido PDB de la estructura predicha."
    ),
)
async def predict_structure(body: PredictStructureRequest):
    try:
        pdb_content = await esmfold.predict_structure(body.sequence)
    except httpx.HTTPStatusError as exc:
        logger.error("ESMFold API error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Error al contactar el servicio ESMFold (HTTP {exc.response.status_code}). Intente nuevamente.",
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="La prediccion de estructura tardo demasiado. Intente con una secuencia mas corta.",
        )

    return PredictStructureResponse(
        sequence=body.sequence,
        length=len(body.sequence),
        pdb_content=pdb_content,
    )


# ── AlphaFold DB: prediction ────────────────────────────────────────────

@router.get(
    "/alphafold/{uniprot_id}",
    response_model=AlphaFoldEntryResponse,
    summary="Consultar AlphaFold DB",
    description=(
        "Busca la prediccion de estructura en AlphaFold Database usando un "
        "identificador UniProt (ej. P00533) o un model ID. "
        "Descarga automaticamente el archivo PDB."
    ),
)
async def get_alphafold_entry(uniprot_id: str):
    try:
        result = await alphafold_db.fetch_prediction(uniprot_id)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontro una prediccion en AlphaFold DB para '{uniprot_id}'.",
            )
        logger.error("AlphaFold DB API error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar AlphaFold DB (HTTP {exc.response.status_code}).",
        )

    # Download the actual PDB content if URL is available
    pdb_content = None
    if result.get("pdb_url"):
        try:
            pdb_content = await alphafold_db.download_pdb(result["pdb_url"])
        except Exception as exc:
            logger.warning("Could not download PDB from %s: %s", result["pdb_url"], exc)

    return AlphaFoldEntryResponse(
        **{k: v for k, v in result.items() if k != "raw"},
        pdb_content=pdb_content,
        raw=result.get("raw", {}),
    )


# ── AlphaFold DB: complexes ─────────────────────────────────────────────

@router.get(
    "/alphafold/{qualifier}/complex",
    response_model=AlphaFoldComplexResponse,
    summary="Consultar complejos en AlphaFold DB",
    description=(
        "Obtiene modelos de complejos proteicos para un UniProt accession o model ID."
    ),
)
async def get_alphafold_complex(qualifier: str):
    try:
        complexes = await alphafold_db.fetch_complex(qualifier)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron complejos para '{qualifier}'.",
            )
        logger.error("AlphaFold complex API error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar complejos (HTTP {exc.response.status_code}).",
        )

    return AlphaFoldComplexResponse(
        qualifier=qualifier,
        complexes=complexes,
        total=len(complexes),
    )


# ── AlphaFold DB: annotations (AlphaMissense) ──────────────────────────

@router.get(
    "/alphafold/{uniprot_id}/annotations",
    response_model=AlphaFoldAnnotationsResponse,
    summary="Consultar anotaciones AlphaMissense",
    description=(
        "Obtiene anotaciones de AlphaMissense (prediccion de patogenicidad de mutaciones) "
        "para un UniProt accession."
    ),
)
async def get_alphafold_annotations(
    uniprot_id: str,
    annotation_type: str = Query(default="MUTAGEN", description="Tipo de anotacion"),
):
    try:
        data = await alphafold_db.fetch_annotations(uniprot_id, annotation_type)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron anotaciones para '{uniprot_id}'.",
            )
        logger.error("AlphaFold annotations API error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Error al consultar anotaciones (HTTP {exc.response.status_code}).",
        )

    return AlphaFoldAnnotationsResponse(
        uniprot_id=uniprot_id,
        annotation_type=annotation_type,
        data=data,
    )
