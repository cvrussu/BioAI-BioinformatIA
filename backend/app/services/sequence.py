"""Service layer for local sequence analysis and remote BLAST searches."""

from __future__ import annotations

import io
from typing import Any

from Bio.Blast import NCBIWWW, NCBIXML

from app.utils.bio_utils import analyse_protein_sequence


def analyse(sequence: str) -> dict[str, Any]:
    """Run local physico-chemical analysis on a protein sequence.

    Delegates heavy lifting to :func:`app.utils.bio_utils.analyse_protein_sequence`.
    """
    props = analyse_protein_sequence(sequence)

    return {
        "sequence": sequence,
        "length": len(sequence),
        "molecular_weight": props["molecular_weight"],
        "isoelectric_point": props["isoelectric_point"],
        "gravy": props["gravy"],
        "aromaticity": props["aromaticity"],
        "instability_index": props["instability_index"],
        "composition": {
            "counts": props["composition_counts"],
            "percentages": props["composition_pct"],
        },
    }


def run_blast(
    sequence: str,
    program: str = "blastp",
    database: str = "nr",
    evalue: float = 0.01,
    max_hits: int = 10,
) -> dict[str, Any]:
    """Submit a BLAST search to NCBI via Biopython qblast and parse results.

    **Warning**: this is a blocking call that can take 30 seconds to several
    minutes depending on NCBI load. It is run inside a thread pool by the
    router so it does not block the event loop.

    Returns a dict ready to be serialised as :class:`BlastResponse`.
    """
    result_handle = NCBIWWW.qblast(
        program=program,
        database=database,
        sequence=sequence,
        expect=evalue,
        hitlist_size=max_hits,
    )

    blast_records = NCBIXML.parse(io.StringIO(result_handle.read()))
    record = next(blast_records)

    hits: list[dict[str, Any]] = []
    for alignment in record.alignments:
        hsp = alignment.hsps[0]  # best HSP per alignment
        identity_pct = round(hsp.identities / hsp.align_length * 100, 1) if hsp.align_length else None
        hits.append(
            {
                "title": alignment.title,
                "accession": alignment.accession,
                "length": alignment.length,
                "e_value": hsp.expect,
                "score": hsp.score,
                "identity_pct": identity_pct,
                "query_cover": None,  # not directly available from XML output
            }
        )

    return {
        "program": program,
        "database": database,
        "hits": hits,
        "total_hits": len(hits),
    }
