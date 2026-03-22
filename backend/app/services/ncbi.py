"""NCBI E-utilities client for ClinVar and OMIM lookups."""

from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
TIMEOUT = 30.0


async def _esearch(db: str, term: str, retmax: int = 20) -> list[str]:
    """Run an ESearch query and return a list of IDs."""
    url = f"{EUTILS_BASE}/esearch.fcgi"
    params = {"db": db, "term": term, "retmode": "json", "retmax": retmax}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
    data = resp.json()
    return data.get("esearchresult", {}).get("idlist", [])


async def _esummary(db: str, ids: list[str]) -> dict[str, Any]:
    """Run an ESummary query and return the result dict."""
    if not ids:
        return {}
    url = f"{EUTILS_BASE}/esummary.fcgi"
    params = {"db": db, "id": ",".join(ids), "retmode": "json"}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
    data = resp.json()
    return data.get("result", {})


# ── ClinVar ──────────────────────────────────────────────────────────────

async def search_clinvar(query: str, max_results: int = 20) -> list[dict]:
    """Search ClinVar for variants matching *query* (gene, variant, condition)."""
    ids = await _esearch("clinvar", query, retmax=max_results)
    if not ids:
        return []

    summaries = await _esummary("clinvar", ids)
    results: list[dict] = []
    for uid in ids:
        doc = summaries.get(uid, {})
        if not isinstance(doc, dict):
            continue

        genes = doc.get("genes", [])
        gene_str = ", ".join(g.get("symbol", "") for g in genes) if isinstance(genes, list) else ""

        results.append({
            "uid": uid,
            "title": doc.get("title", ""),
            "gene": gene_str,
            "clinical_significance": doc.get("clinical_significance", {}).get("description", "")
            if isinstance(doc.get("clinical_significance"), dict)
            else str(doc.get("clinical_significance", "")),
            "condition": doc.get("trait_set", [{}])[0].get("trait_name", "")
            if isinstance(doc.get("trait_set"), list) and doc.get("trait_set")
            else "",
            "review_status": doc.get("clinical_significance", {}).get("review_status", "")
            if isinstance(doc.get("clinical_significance"), dict)
            else "",
            "variation_type": doc.get("obj_type", ""),
            "accession": doc.get("accession", ""),
            "url": f"https://www.ncbi.nlm.nih.gov/clinvar/variation/{uid}/",
        })
    return results


# ── OMIM ─────────────────────────────────────────────────────────────────

async def search_omim(query: str, max_results: int = 20) -> list[dict]:
    """Search OMIM for genetic disorders matching *query*."""
    ids = await _esearch("omim", query, retmax=max_results)
    if not ids:
        return []

    summaries = await _esummary("omim", ids)
    results: list[dict] = []
    for uid in ids:
        doc = summaries.get(uid, {})
        if not isinstance(doc, dict):
            continue
        results.append({
            "uid": uid,
            "title": doc.get("title", ""),
            "mim_number": uid,
            "url": f"https://omim.org/entry/{uid}",
        })
    return results
