"""Pydantic v2 request / response schemas for every endpoint."""

from __future__ import annotations

import re
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

VALID_AA = set("ACDEFGHIKLMNPQRSTVWY")


def _validate_protein_sequence(seq: str) -> str:
    seq = seq.strip().upper()
    invalid = set(seq) - VALID_AA
    if invalid:
        raise ValueError(
            f"Caracteres no válidos en la secuencia: {', '.join(sorted(invalid))}. "
            "Solo se permiten aminoácidos estándar (A-Y sin B/J/O/U/X/Z)."
        )
    if len(seq) == 0:
        raise ValueError("La secuencia no puede estar vacía.")
    return seq


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class IndustryContext(str, Enum):
    mining = "minería"
    aquaculture = "acuicultura"
    food = "alimentos"
    pharma = "farmacéutica"
    agriculture = "agricultura"
    environment = "medioambiente"
    general = "general"


# ---------------------------------------------------------------------------
# Structure endpoints
# ---------------------------------------------------------------------------

class PredictStructureRequest(BaseModel):
    sequence: str = Field(
        ...,
        min_length=1,
        max_length=400,
        description="Secuencia de aminoácidos (máx. 400 residuos para ESMFold).",
        examples=["MGSSHHHHHHSSGLVPRGSHM"],
    )

    @field_validator("sequence")
    @classmethod
    def clean_sequence(cls, v: str) -> str:
        return _validate_protein_sequence(v)


class PredictStructureResponse(BaseModel):
    sequence: str
    length: int
    pdb_content: str = Field(..., description="Contenido del archivo PDB.")
    message: str = "Predicción de estructura completada exitosamente."


class AlphaFoldEntryResponse(BaseModel):
    uniprot_id: str
    gene: str | None = None
    organism: str | None = None
    pdb_url: str | None = None
    cif_url: str | None = None
    pae_image_url: str | None = None
    confidence_avg: float | None = None
    pdb_content: str | None = Field(default=None, description="Contenido PDB descargado.")
    raw: dict[str, Any] = Field(default_factory=dict, description="Respuesta cruda de AlphaFold DB.")


class AlphaFoldComplexResponse(BaseModel):
    qualifier: str
    complexes: list[dict[str, Any]]
    total: int


class AlphaFoldAnnotationsResponse(BaseModel):
    uniprot_id: str
    annotation_type: str
    data: dict[str, Any]


# ---------------------------------------------------------------------------
# Analysis endpoints
# ---------------------------------------------------------------------------

class SequenceAnalysisRequest(BaseModel):
    sequence: str = Field(..., min_length=1, description="Secuencia de aminoácidos.")

    @field_validator("sequence")
    @classmethod
    def clean_sequence(cls, v: str) -> str:
        return _validate_protein_sequence(v)


class AminoAcidComposition(BaseModel):
    counts: dict[str, int]
    percentages: dict[str, float]


class SequenceAnalysisResponse(BaseModel):
    sequence: str
    length: int
    molecular_weight: float = Field(..., description="Peso molecular en Daltons.")
    isoelectric_point: float = Field(..., description="Punto isoeléctrico teórico (pI).")
    gravy: float = Field(..., description="GRAVY (Grand Average of Hydropathy).")
    aromaticity: float
    instability_index: float
    composition: AminoAcidComposition
    message: str = "Análisis de secuencia completado exitosamente."


class BlastRequest(BaseModel):
    sequence: str = Field(..., min_length=1, description="Secuencia de aminoácidos o nucleótidos.")
    program: str = Field(
        default="blastp",
        description="Programa BLAST (blastp, blastn, blastx, tblastn, tblastx).",
    )
    database: str = Field(default="nr", description="Base de datos BLAST.")
    evalue: float = Field(default=0.01, gt=0, description="Umbral de E-value.")
    max_hits: int = Field(default=10, ge=1, le=50, description="Número máximo de hits.")

    @field_validator("sequence")
    @classmethod
    def clean_blast_seq(cls, v: str) -> str:
        v = re.sub(r"\s+", "", v.strip().upper())
        if not v:
            raise ValueError("La secuencia no puede estar vacía.")
        return v


class BlastHit(BaseModel):
    title: str
    accession: str
    length: int
    e_value: float
    score: float
    identity_pct: float | None = None
    query_cover: str | None = None


class BlastResponse(BaseModel):
    program: str
    database: str
    hits: list[BlastHit]
    total_hits: int
    message: str = "Búsqueda BLAST completada exitosamente."


class PrimerDesignRequest(BaseModel):
    sequence: str = Field(..., min_length=20, description="Secuencia de ADN template.")
    target_start: int = Field(default=0, ge=0, description="Posicion de inicio del target.")
    target_length: int = Field(default=0, ge=0, description="Longitud de la region target.")
    num_return: int = Field(default=5, ge=1, le=10, description="Numero de pares a retornar.")
    opt_size: int = Field(default=20, ge=15, le=30, description="Tamaño optimo del primer.")
    opt_tm: float = Field(default=60.0, ge=50.0, le=72.0, description="Tm optimo.")

    @field_validator("sequence")
    @classmethod
    def clean_dna(cls, v: str) -> str:
        v = re.sub(r"\s+", "", v.strip().upper())
        invalid = set(v) - set("ACGT")
        if invalid:
            raise ValueError(
                f"Caracteres no validos para ADN: {', '.join(sorted(invalid))}."
            )
        return v


# ---------------------------------------------------------------------------
# Interpretation endpoint
# ---------------------------------------------------------------------------

class InterpretRequest(BaseModel):
    results: dict[str, Any] = Field(
        ..., description="Resultados del análisis a interpretar."
    )
    context: str = Field(
        default="",
        description="Contexto adicional proporcionado por el usuario.",
    )
    industry: IndustryContext = Field(
        default=IndustryContext.general,
        description="Industria del usuario para contextualizar la interpretación.",
    )


class InterpretResponse(BaseModel):
    interpretation: str = Field(
        ..., description="Interpretación generada en español."
    )
    industry: str
    model_used: str
    message: str = "Interpretación generada exitosamente."


# ---------------------------------------------------------------------------
# User registration
# ---------------------------------------------------------------------------


class UserRegistrationRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Nombre completo del usuario.")
    email: str = Field(
        ...,
        pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        description="Correo electrónico válido.",
    )
    organization: str = Field(..., min_length=1, description="Organización o empresa.")
    industry: str = Field(..., min_length=1, description="Industria o sector.")


class UserRegistrationResponse(BaseModel):
    message: str = "Registro exitoso"
    email: str


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    service: str = "BioAI — Bioinformático AI"
