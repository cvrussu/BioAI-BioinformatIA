"""ChEMBL API client for drug/molecule lookups."""

from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)

CHEMBL_BASE = "https://www.ebi.ac.uk/chembl/api/data"
TIMEOUT = 30.0


async def search_drugs(query: str, max_results: int = 15) -> list[dict]:
    """Search ChEMBL for molecules matching *query* (drug name, target, etc.)."""
    url = f"{CHEMBL_BASE}/molecule/search.json"
    params = {"q": query, "limit": max_results}

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()

    data = resp.json()
    molecules = data.get("molecules", [])

    results: list[dict] = []
    for mol in molecules:
        props = mol.get("molecule_properties", {}) or {}
        results.append({
            "chembl_id": mol.get("molecule_chembl_id", ""),
            "name": mol.get("pref_name", "") or mol.get("molecule_chembl_id", ""),
            "molecule_type": mol.get("molecule_type", ""),
            "max_phase": mol.get("max_phase", 0),
            "first_approval": mol.get("first_approval"),
            "oral": mol.get("oral", False),
            "molecular_weight": props.get("full_mwt"),
            "alogp": props.get("alogp"),
            "hba": props.get("hba"),
            "hbd": props.get("hbd"),
            "url": f"https://www.ebi.ac.uk/chembl/compound_report_card/{mol.get('molecule_chembl_id', '')}",
        })
    return results
