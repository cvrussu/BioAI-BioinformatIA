"""OpenTargets Platform GraphQL API client."""

from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)

OT_BASE = "https://api.platform.opentargets.org/api/v4/graphql"
TIMEOUT = 30.0


async def search_target(query: str, size: int = 10) -> list[dict]:
    """Search OpenTargets for a target (gene/protein) by name or symbol."""
    gql = {
        "query": """
        query SearchTarget($q: String!, $size: Int!) {
          search(queryString: $q, entityNames: ["target"], page: {size: $size, index: 0}) {
            total
            hits {
              id
              name
              description
              entity
            }
          }
        }
        """,
        "variables": {"q": query, "size": size},
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(OT_BASE, json=gql)
        resp.raise_for_status()

    data = resp.json()
    hits = data.get("data", {}).get("search", {}).get("hits", [])
    results: list[dict] = []
    for h in hits:
        results.append({
            "id": h.get("id", ""),
            "name": h.get("name", ""),
            "symbol": h.get("name", ""),
            "description": h.get("description", ""),
            "biotype": h.get("entity", ""),
            "url": f"https://platform.opentargets.org/target/{h.get('id', '')}",
        })
    return results


async def get_associations(target_id: str, size: int = 10) -> list[dict]:
    """Get disease associations for a given target (Ensembl gene ID)."""
    gql = {
        "query": """
        query Associations($id: String!, $size: Int!) {
          target(ensemblId: $id) {
            approvedSymbol
            associatedDiseases(page: {size: $size, index: 0}) {
              count
              rows {
                disease {
                  id
                  name
                }
                score
                datatypeScores {
                  id
                  score
                }
              }
            }
          }
        }
        """,
        "variables": {"id": target_id, "size": size},
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(OT_BASE, json=gql)
        resp.raise_for_status()

    data = resp.json()
    target = data.get("data", {}).get("target", {})
    if not target:
        return []

    rows = target.get("associatedDiseases", {}).get("rows", [])
    results: list[dict] = []
    for r in rows:
        disease = r.get("disease", {})
        results.append({
            "disease_id": disease.get("id", ""),
            "disease_name": disease.get("name", ""),
            "score": round(r.get("score", 0), 4),
            "url": f"https://platform.opentargets.org/disease/{disease.get('id', '')}",
        })
    return results
