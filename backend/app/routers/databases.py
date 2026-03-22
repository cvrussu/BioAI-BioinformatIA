"""Endpoints for ClinVar, OMIM, OpenTargets, and ChEMBL lookups."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query

from app.services import ncbi, opentargets, drugbank

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/databases", tags=["Bases de Datos"])


# ── ClinVar ──────────────────────────────────────────────────────────────


@router.get(
    "/clinvar/search",
    summary="Buscar en ClinVar",
    description="Busca variantes clinicas por gen, condicion o ID de variante.",
)
async def clinvar_search(
    q: str = Query(..., min_length=2, description="Gen, variante o condicion"),
    max_results: int = Query(20, ge=1, le=50),
):
    try:
        results = await ncbi.search_clinvar(q, max_results=max_results)
    except Exception as exc:
        logger.exception("ClinVar search error")
        raise HTTPException(status_code=502, detail=f"Error en ClinVar: {exc}")
    return {"query": q, "results": results, "total": len(results)}


# ── OMIM ─────────────────────────────────────────────────────────────────


@router.get(
    "/omim/search",
    summary="Buscar en OMIM",
    description="Busca enfermedades geneticas en OMIM.",
)
async def omim_search(
    q: str = Query(..., min_length=2, description="Gen o enfermedad"),
    max_results: int = Query(20, ge=1, le=50),
):
    try:
        results = await ncbi.search_omim(q, max_results=max_results)
    except Exception as exc:
        logger.exception("OMIM search error")
        raise HTTPException(status_code=502, detail=f"Error en OMIM: {exc}")
    return {"query": q, "results": results, "total": len(results)}


# ── OpenTargets ──────────────────────────────────────────────────────────


@router.get(
    "/opentargets/search",
    summary="Buscar target en OpenTargets",
    description="Busca un target (gen/proteina) en OpenTargets Platform.",
)
async def opentargets_search(
    q: str = Query(..., min_length=2, description="Nombre de gen o proteina"),
    size: int = Query(10, ge=1, le=25),
):
    try:
        results = await opentargets.search_target(q, size=size)
    except Exception as exc:
        logger.exception("OpenTargets search error")
        raise HTTPException(status_code=502, detail=f"Error en OpenTargets: {exc}")
    return {"query": q, "results": results, "total": len(results)}


@router.get(
    "/opentargets/{target_id}/associations",
    summary="Asociaciones gen-enfermedad",
    description="Obtiene asociaciones enfermedad-target de OpenTargets.",
)
async def opentargets_associations(
    target_id: str,
    size: int = Query(10, ge=1, le=25),
):
    try:
        results = await opentargets.get_associations(target_id, size=size)
    except Exception as exc:
        logger.exception("OpenTargets associations error")
        raise HTTPException(status_code=502, detail=f"Error en OpenTargets: {exc}")
    return {"target_id": target_id, "associations": results, "total": len(results)}


# ── ChEMBL / Drugs ──────────────────────────────────────────────────────


@router.get(
    "/drugs/search",
    summary="Buscar farmacos",
    description="Busca moleculas y farmacos en la base de datos ChEMBL.",
)
async def drugs_search(
    q: str = Query(..., min_length=2, description="Nombre de farmaco o target"),
    max_results: int = Query(15, ge=1, le=50),
):
    try:
        results = await drugbank.search_drugs(q, max_results=max_results)
    except Exception as exc:
        logger.exception("ChEMBL search error")
        raise HTTPException(status_code=502, detail=f"Error en ChEMBL: {exc}")
    return {"query": q, "results": results, "total": len(results)}
