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
ALPHAFOLD_FILES = "https://alphafold.ebi.ac.uk/files"
ALPHAFOLD_VERSION = "v6"


def _build_urls_from_id(uniprot_id: str) -> dict[str, str]:
    """Construct known AlphaFold file URLs directly from a UniProt accession.

    These static file URLs work even when the metadata API is unavailable.
    Pattern: AF-{UNIPROT_ID}-F1-model_{version}.pdb
    """
    uid = uniprot_id.upper()
    prefix = f"{ALPHAFOLD_FILES}/AF-{uid}-F1"
    return {
        "pdb_url": f"{prefix}-model_{ALPHAFOLD_VERSION}.pdb",
        "cif_url": f"{prefix}-model_{ALPHAFOLD_VERSION}.cif",
        "pae_image_url": f"{prefix}-predicted_aligned_error_{ALPHAFOLD_VERSION}.png",
    }


async def fetch_prediction(uniprot_id: str, timeout: float = 30.0) -> dict[str, Any]:
    """Fetch structure prediction metadata from AlphaFold DB.

    Tries the metadata API first; if it returns a server error (5xx) or times out,
    falls back to constructing known file URLs directly from the UniProt ID pattern.
    """
    url = f"{ALPHAFOLD_BASE}/prediction/{uniprot_id}"

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(url)
            response.raise_for_status()

        data: list[dict[str, Any]] = response.json()
        if data:
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

    except httpx.HTTPStatusError as exc:
        # 404 = not in DB — re-raise so the router returns 404 to the client
        if exc.response.status_code == 404:
            raise
        # 5xx from EBI (common from cloud IPs) — fall through to URL construction
        import logging
        logging.getLogger(__name__).warning(
            "AlphaFold metadata API returned %s for %s — using direct file URLs",
            exc.response.status_code,
            uniprot_id,
        )
    except (httpx.TimeoutException, httpx.ConnectError) as exc:
        import logging
        logging.getLogger(__name__).warning(
            "AlphaFold metadata API unreachable (%s) — using direct file URLs", exc
        )

    # Fallback: construct known file URLs from the UniProt ID pattern.
    # Verify the PDB URL is reachable before returning.
    urls = _build_urls_from_id(uniprot_id)
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            head = await client.head(urls["pdb_url"])
            if head.status_code == 404:
                # UniProt ID not in AlphaFold DB
                raise httpx.HTTPStatusError(
                    "Not found", request=head.request, response=head
                )
    except httpx.HTTPStatusError:
        raise
    except Exception:
        pass  # Network error — still return the URLs; download will fail if unreachable

    return {
        "uniprot_id": uniprot_id.upper(),
        "gene": None,
        "organism": None,
        "pdb_url": urls["pdb_url"],
        "cif_url": urls["cif_url"],
        "pae_image_url": urls["pae_image_url"],
        "confidence_avg": None,
        "raw": {},
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
