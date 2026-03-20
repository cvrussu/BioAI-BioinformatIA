"""Service layer for AlphaFold Database lookups.

Official API docs: https://alphafold.ebi.ac.uk/api-docs
Base URL: https://alphafold.ebi.ac.uk/api

Endpoints used:
  GET /prediction/{qualifier}         — Structure prediction by UniProt accession or model ID
  GET /complex/{qualifier}            — Complex models by UniProt accession or model ID
  GET /uniprot/summary/{qualifier}.json — UniProt summary with residue ranges
  GET /annotations/{qualifier}.json   — Annotations (e.g., AlphaMissense MUTAGEN)
"""

from __future__ import annotations

from typing import Any

import httpx

from app.config import settings

ALPHAFOLD_BASE = "https://alphafold.ebi.ac.uk/api"


async def fetch_prediction(uniprot_id: str, timeout: float = 30.0) -> dict[str, Any]:
    """Fetch structure prediction metadata from AlphaFold DB.

    GET /prediction/{qualifier}
    """
    url = f"{ALPHAFOLD_BASE}/prediction/{uniprot_id}"

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url)
        response.raise_for_status()

    data: list[dict[str, Any]] = response.json()
    if not data:
        return {"uniprot_id": uniprot_id, "raw": {}}

    entry = data[0]

    return {
        "uniprot_id": entry.get("uniprotAccession", uniprot_id),
        "gene": entry.get("gene"),
        "organism": entry.get("organismScientificName"),
        "pdb_url": entry.get("pdbUrl"),
        "cif_url": entry.get("cifUrl"),
        "pae_image_url": entry.get("paeImageUrl"),
        "confidence_avg": entry.get("globalMetricValue"),
        "raw": entry,
    }


async def fetch_complex(qualifier: str, timeout: float = 30.0) -> list[dict[str, Any]]:
    """Fetch complex models for a UniProt accession or model ID.

    GET /complex/{qualifier}
    """
    url = f"{ALPHAFOLD_BASE}/complex/{qualifier}"

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url)
        response.raise_for_status()

    return response.json()


async def fetch_uniprot_summary(qualifier: str, timeout: float = 30.0) -> dict[str, Any]:
    """Fetch UniProt summary with structure and residue range info.

    GET /uniprot/summary/{qualifier}.json
    """
    url = f"{ALPHAFOLD_BASE}/uniprot/summary/{qualifier}.json"

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url)
        response.raise_for_status()

    return response.json()


async def fetch_annotations(
    uniprot_id: str, annotation_type: str = "MUTAGEN", timeout: float = 30.0
) -> dict[str, Any]:
    """Fetch annotations (e.g., AlphaMissense) for a UniProt accession.

    GET /annotations/{qualifier}.json?type={annotation_type}
    """
    url = f"{ALPHAFOLD_BASE}/annotations/{uniprot_id}.json"

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url, params={"type": annotation_type})
        response.raise_for_status()

    return response.json()


async def download_pdb(pdb_url: str, timeout: float = 60.0) -> str:
    """Download PDB file content from an AlphaFold PDB URL."""
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(pdb_url)
        response.raise_for_status()

    return response.text
