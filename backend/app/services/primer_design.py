"""Primer design using primer3-py."""

from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)


def _validate_dna(seq: str) -> str:
    seq = re.sub(r"\s+", "", seq.upper())
    invalid = set(seq) - set("ACGT")
    if invalid:
        raise ValueError(
            f"Caracteres no validos para ADN: {', '.join(sorted(invalid))}. "
            "Solo se permiten A, C, G, T."
        )
    if len(seq) < 20:
        raise ValueError("La secuencia debe tener al menos 20 nucleotidos.")
    return seq


def design_primers(
    sequence: str,
    target_start: int = 0,
    target_length: int = 0,
    num_return: int = 5,
    opt_size: int = 20,
    opt_tm: float = 60.0,
) -> dict:
    """Design PCR primers using primer3.

    Returns a dict with a list of primer pairs and their properties.
    """
    try:
        import primer3
    except ImportError:
        raise RuntimeError(
            "primer3-py no esta instalado. Ejecuta: pip install primer3-py"
        )

    seq = _validate_dna(sequence)

    # If no target specified, target the middle third of the sequence
    if target_start == 0 and target_length == 0:
        target_start = len(seq) // 3
        target_length = len(seq) // 3

    seq_args = {
        "SEQUENCE_ID": "bioai_input",
        "SEQUENCE_TEMPLATE": seq,
        "SEQUENCE_TARGET": [target_start, target_length],
    }

    global_args = {
        "PRIMER_NUM_RETURN": num_return,
        "PRIMER_OPT_SIZE": opt_size,
        "PRIMER_MIN_SIZE": 18,
        "PRIMER_MAX_SIZE": 25,
        "PRIMER_OPT_TM": opt_tm,
        "PRIMER_MIN_TM": 57.0,
        "PRIMER_MAX_TM": 63.0,
        "PRIMER_MIN_GC": 20.0,
        "PRIMER_MAX_GC": 80.0,
        "PRIMER_PRODUCT_SIZE_RANGE": [[100, 1000]],
    }

    result = primer3.bindings.design_primers(seq_args, global_args)

    num_found = result.get("PRIMER_PAIR_NUM_RETURNED", 0)
    primers: list[dict] = []

    for i in range(num_found):
        left_seq = result.get(f"PRIMER_LEFT_{i}_SEQUENCE", "")
        right_seq = result.get(f"PRIMER_RIGHT_{i}_SEQUENCE", "")
        left_tm = result.get(f"PRIMER_LEFT_{i}_TM", 0)
        right_tm = result.get(f"PRIMER_RIGHT_{i}_TM", 0)
        left_gc = result.get(f"PRIMER_LEFT_{i}_GC_PERCENT", 0)
        right_gc = result.get(f"PRIMER_RIGHT_{i}_GC_PERCENT", 0)
        product_size = result.get(f"PRIMER_PAIR_{i}_PRODUCT_SIZE", 0)
        penalty = result.get(f"PRIMER_PAIR_{i}_PENALTY", 0)

        primers.append({
            "pair_index": i,
            "forward_sequence": left_seq,
            "reverse_sequence": right_seq,
            "forward_tm": round(left_tm, 1),
            "reverse_tm": round(right_tm, 1),
            "forward_gc_pct": round(left_gc, 1),
            "reverse_gc_pct": round(right_gc, 1),
            "product_size": product_size,
            "penalty": round(penalty, 2),
        })

    return {
        "sequence_length": len(seq),
        "target_start": target_start,
        "target_length": target_length,
        "num_returned": num_found,
        "primers": primers,
    }
