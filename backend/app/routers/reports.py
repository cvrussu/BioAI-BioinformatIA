"""Endpoints for generating downloadable reports (PDF, PDB)."""

from __future__ import annotations

import io
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

router = APIRouter(prefix="/reports", tags=["Reportes"])


class StructureReportRequest(BaseModel):
    """Data for generating a structure prediction report."""
    sequence: str
    length: int
    pdb_content: str
    uniprot_id: str | None = None
    gene: str | None = None
    organism: str | None = None
    confidence: float | None = None
    source: str = Field(default="ESMFold", description="ESMFold o AlphaFold DB")


class AnalysisReportRequest(BaseModel):
    """Data for generating a sequence analysis report."""
    sequence: str
    length: int
    molecular_weight: float
    isoelectric_point: float
    gravy: float
    aromaticity: float | None = None
    instability_index: float | None = None
    composition: dict[str, float] | None = None


# ── PDF Generation helpers ──────────────────────────────────────────────

PRIMARY = HexColor("#1e3a5f")
TEAL = HexColor("#0d9488")


def _build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "BioTitle", parent=styles["Title"], fontSize=20, textColor=PRIMARY,
        spaceAfter=12,
    ))
    styles.add(ParagraphStyle(
        "BioHeading", parent=styles["Heading2"], fontSize=14, textColor=TEAL,
        spaceBefore=16, spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        "BioBody", parent=styles["Normal"], fontSize=10, leading=14,
        spaceAfter=6,
    ))
    return styles


def _header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(HexColor("#64748b"))
    canvas.drawString(inch, 0.5 * inch, f"BioAI — ScienSolutions SpA — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    canvas.drawRightString(letter[0] - inch, 0.5 * inch, f"Pagina {doc.page}")
    canvas.restoreState()


# ── Endpoints ───────────────────────────────────────────────────────────

@router.post(
    "/structure/pdf",
    summary="Generar reporte PDF de estructura",
    description="Genera un reporte PDF con los resultados de prediccion de estructura.",
)
async def generate_structure_report(body: StructureReportRequest):
    styles = _build_styles()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=inch, bottomMargin=inch)

    story = []

    # Title
    story.append(Paragraph("Reporte de Estructura de Proteina", styles["BioTitle"]))
    story.append(Paragraph(f"Generado por BioAI — Fuente: {body.source}", styles["BioBody"]))
    story.append(Spacer(1, 16))

    # Summary table
    story.append(Paragraph("Resumen", styles["BioHeading"]))
    data = [["Parametro", "Valor"]]
    data.append(["Fuente", body.source])
    data.append(["Longitud de secuencia", str(body.length)])
    if body.uniprot_id:
        data.append(["UniProt ID", body.uniprot_id])
    if body.gene:
        data.append(["Gen", body.gene])
    if body.organism:
        data.append(["Organismo", body.organism])
    if body.confidence:
        data.append(["Confianza promedio (pLDDT)", f"{body.confidence:.1f}"])
    data.append(["Lineas PDB", str(len(body.pdb_content.split("\n")))])

    t = Table(data, colWidths=[3 * inch, 3.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f8fafc"), HexColor("#ffffff")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # Sequence
    story.append(Paragraph("Secuencia", styles["BioHeading"]))
    seq_display = body.sequence[:200] + ("..." if len(body.sequence) > 200 else "")
    story.append(Paragraph(f"<font face='Courier' size='8'>{seq_display}</font>", styles["BioBody"]))
    story.append(Spacer(1, 16))

    # Notes
    story.append(Paragraph("Notas", styles["BioHeading"]))
    story.append(Paragraph(
        "Este reporte fue generado automaticamente por la plataforma BioAI. "
        "La estructura fue predicha usando algoritmos de deep learning. "
        "Para uso en publicaciones, cite la fuente original del predictor utilizado.",
        styles["BioBody"],
    ))

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    buf.seek(0)

    filename = f"bioai_estructura_{body.source.lower()}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post(
    "/analysis/pdf",
    summary="Generar reporte PDF de analisis",
    description="Genera un reporte PDF con los resultados de analisis de secuencia.",
)
async def generate_analysis_report(body: AnalysisReportRequest):
    styles = _build_styles()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=inch, bottomMargin=inch)

    story = []

    story.append(Paragraph("Reporte de Analisis de Secuencia", styles["BioTitle"]))
    story.append(Paragraph("Generado por BioAI — Analisis fisicoquimico de proteina", styles["BioBody"]))
    story.append(Spacer(1, 16))

    # Properties table
    story.append(Paragraph("Propiedades Fisicoquimicas", styles["BioHeading"]))
    data = [["Parametro", "Valor"]]
    data.append(["Longitud", f"{body.length} residuos"])
    data.append(["Peso Molecular", f"{body.molecular_weight:.1f} Da"])
    data.append(["Punto Isoelectrico (pI)", f"{body.isoelectric_point:.2f}"])
    data.append(["GRAVY (hidrofobicidad)", f"{body.gravy:.3f}"])
    if body.aromaticity is not None:
        data.append(["Aromaticidad", f"{body.aromaticity:.4f}"])
    if body.instability_index is not None:
        data.append(["Indice de Inestabilidad", f"{body.instability_index:.2f}"])

    t = Table(data, colWidths=[3 * inch, 3.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f8fafc"), HexColor("#ffffff")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # Composition
    if body.composition:
        story.append(Paragraph("Composicion de Aminoacidos", styles["BioHeading"]))
        comp_data = [["Aminoacido", "Porcentaje"]]
        sorted_aa = sorted(body.composition.items(), key=lambda x: x[1], reverse=True)
        for aa, pct in sorted_aa:
            comp_data.append([aa, f"{pct * 100:.1f}%"])

        ct = Table(comp_data, colWidths=[2 * inch, 2 * inch])
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TEAL),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f8fafc"), HexColor("#ffffff")]),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(ct)
        story.append(Spacer(1, 16))

    # Sequence
    story.append(Paragraph("Secuencia", styles["BioHeading"]))
    seq_display = body.sequence[:200] + ("..." if len(body.sequence) > 200 else "")
    story.append(Paragraph(f"<font face='Courier' size='8'>{seq_display}</font>", styles["BioBody"]))

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    buf.seek(0)

    filename = f"bioai_analisis_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post(
    "/structure/pdb",
    summary="Descargar archivo PDB",
    description="Descarga el contenido PDB como archivo.",
)
async def download_pdb_file(body: StructureReportRequest):
    if not body.pdb_content:
        raise HTTPException(status_code=400, detail="No hay contenido PDB para descargar.")

    buf = io.BytesIO(body.pdb_content.encode("utf-8"))
    filename = f"bioai_{body.source.lower()}_{body.uniprot_id or 'prediction'}.pdb"
    return StreamingResponse(
        buf,
        media_type="chemical/x-pdb",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
