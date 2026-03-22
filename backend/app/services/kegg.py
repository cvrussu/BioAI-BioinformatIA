"""KEGG REST API client for pathway and gene lookups."""

from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)

KEGG_BASE = "https://rest.kegg.jp"
TIMEOUT = 30.0


async def search_kegg(query: str, category: str = "pathway") -> list[dict]:
    """Search KEGG for pathways or genes matching *query*."""
    url = f"{KEGG_BASE}/find/{category}/{query}"
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    results: list[dict] = []
    for line in resp.text.strip().splitlines():
        if "\t" not in line:
            continue
        entry_id, description = line.split("\t", 1)
        results.append({"id": entry_id.strip(), "description": description.strip()})
    return results


async def get_pathway(pathway_id: str) -> dict:
    """Get details for a specific KEGG pathway."""
    url = f"{KEGG_BASE}/get/{pathway_id}"
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    raw = resp.text
    info: dict = {"id": pathway_id, "raw": raw}

    for line in raw.splitlines():
        if line.startswith("NAME"):
            info["name"] = line.replace("NAME", "").strip()
        elif line.startswith("DESCRIPTION") or line.startswith("DEFINITION"):
            key = "DESCRIPTION" if line.startswith("DESCRIPTION") else "DEFINITION"
            info["definition"] = line.replace(key, "").strip()
        elif line.startswith("CLASS"):
            info["class"] = line.replace("CLASS", "").strip()
        elif line.startswith("ORGANISM"):
            info["organism"] = line.replace("ORGANISM", "").strip()

    # Image URL for pathway maps (works for map/ko/hsa IDs)
    info["image_url"] = f"{KEGG_BASE}/get/{pathway_id}/image"

    return info


async def get_gene_pathways(gene_id: str) -> list[dict]:
    """Get pathways associated with a given gene identifier."""
    url = f"{KEGG_BASE}/link/pathway/{gene_id}"
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    results: list[dict] = []
    for line in resp.text.strip().splitlines():
        if "\t" not in line:
            continue
        gene, pathway = line.split("\t", 1)
        results.append({"gene": gene.strip(), "pathway": pathway.strip()})
    return results
