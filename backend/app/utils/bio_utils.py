"""Bioinformatics utility functions built on top of Biopython."""

from __future__ import annotations

from Bio.SeqUtils.ProtParam import ProteinAnalysis


def analyse_protein_sequence(sequence: str) -> dict:
    """Return a dictionary with common physico-chemical properties.

    Parameters
    ----------
    sequence : str
        Valid uppercase single-letter amino acid sequence.

    Returns
    -------
    dict with keys: molecular_weight, isoelectric_point, gravy,
    aromaticity, instability_index, composition_counts, composition_pct.
    """
    analysis = ProteinAnalysis(sequence)

    counts: dict[str, int] = analysis.count_amino_acids()
    total = sum(counts.values()) or 1
    percentages = {aa: round(cnt / total * 100, 2) for aa, cnt in counts.items()}

    return {
        "molecular_weight": round(analysis.molecular_weight(), 2),
        "isoelectric_point": round(analysis.isoelectric_point(), 2),
        "gravy": round(analysis.gravy(), 4),
        "aromaticity": round(analysis.aromaticity(), 4),
        "instability_index": round(analysis.instability_index(), 2),
        "composition_counts": counts,
        "composition_pct": percentages,
    }
