"""Endpoints for KEGG pathway and gene lookups."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query

from app.services import kegg as kegg_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kegg", tags=["KEGG Pathways"])


@router.get(
    "/search",
    summary="Buscar en KEGG",
    description="Busca pathways o genes en la base de datos KEGG.",
)
async def search(
    q: str = Query(..., min_length=2, description="Termino de busqueda"),
    category: str = Query("pathway", description="Categoria: pathway, genes, compound"),
):
    try:
        results = await kegg_service.search_kegg(q, category=category)
    except Exception as exc:
        logger.exception("KEGG search error")
        raise HTTPException(status_code=502, detail=f"Error en la busqueda KEGG: {exc}")
    return {"query": q, "category": category, "results": results, "total": len(results)}


@router.get(
    "/pathway/{pathway_id}",
    summary="Detalle de pathway",
    description="Obtiene informacion detallada de un pathway KEGG especifico.",
)
async def pathway_detail(pathway_id: str):
    try:
        result = await kegg_service.get_pathway(pathway_id)
    except Exception as exc:
        logger.exception("KEGG pathway detail error")
        raise HTTPException(status_code=502, detail=f"Error al obtener pathway: {exc}")
    return result


@router.get(
    "/gene/{gene_id}/pathways",
    summary="Pathways de un gen",
    description="Lista los pathways asociados a un gen especifico.",
)
async def gene_pathways(gene_id: str):
    try:
        results = await kegg_service.get_gene_pathways(gene_id)
    except Exception as exc:
        logger.exception("KEGG gene pathways error")
        raise HTTPException(status_code=502, detail=f"Error al buscar pathways del gen: {exc}")
    return {"gene_id": gene_id, "pathways": results, "total": len(results)}
