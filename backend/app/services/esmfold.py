"""Service layer for ESMFold structure prediction via the ESM Atlas API."""

from __future__ import annotations

import httpx

from app.config import settings


async def predict_structure(sequence: str, timeout: float = 120.0) -> str:
    """Send a protein sequence to the ESMFold API and return PDB content.

    Parameters
    ----------
    sequence : str
        Valid uppercase amino acid sequence (max 400 residues enforced by schema).
    timeout : float
        HTTP timeout in seconds. ESMFold can be slow for longer sequences.

    Returns
    -------
    str — raw PDB file content.

    Raises
    ------
    httpx.HTTPStatusError on non-2xx responses.
    """
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            settings.esmfold_api_url,
            content=sequence,
            headers={"Content-Type": "text/plain"},
        )
        response.raise_for_status()
        return response.text
