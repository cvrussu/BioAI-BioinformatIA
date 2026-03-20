const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }));
    const detail = error.detail;
    const msg = typeof detail === "string" ? detail : JSON.stringify(detail);
    throw new Error(msg || `Error ${res.status}`);
  }

  return res.json();
}

export interface StructurePrediction {
  pdb_data: string;
  plddt_score?: number;
  sequence_length?: number;
}

export interface AlphaFoldResult {
  pdb_url: string;
  pdb_data?: string;
  uniprot_id: string;
  organism?: string;
  protein_name?: string;
  gene_name?: string;
}

export interface SequenceAnalysis {
  sequence: string;
  length: number;
  molecular_weight: number;
  isoelectric_point: number;
  gravy: number;
  aromaticity?: number;
  instability_index?: number;
  composition?: { counts: Record<string, number>; percentages: Record<string, number> };
  message?: string;
}

export interface AIInterpretation {
  interpretation: string;
  industry: string;
}

export async function predictStructure(
  sequence: string
): Promise<StructurePrediction> {
  return request<StructurePrediction>("/structure/predict", {
    method: "POST",
    body: JSON.stringify({ sequence }),
  });
}

export async function lookupAlphaFold(
  uniprotId: string
): Promise<AlphaFoldResult> {
  return request<AlphaFoldResult>(`/structure/alphafold/${uniprotId}`);
}

export async function analyzeSequence(
  sequence: string
): Promise<SequenceAnalysis> {
  return request<SequenceAnalysis>("/analysis/sequence", {
    method: "POST",
    body: JSON.stringify({ sequence }),
  });
}

export async function interpretResults(
  results: string,
  industry: string
): Promise<AIInterpretation> {
  // Backend expects `results` as an object — try JSON parse, fallback to text wrapper
  let resultsObj: Record<string, unknown>;
  try {
    resultsObj = JSON.parse(results);
  } catch {
    resultsObj = { raw_text: results };
  }
  return request<AIInterpretation>("/interpret", {
    method: "POST",
    body: JSON.stringify({ results: resultsObj, industry }),
  });
}

export async function registerUser(userData: {
  name: string;
  email: string;
  organization: string;
  industry: string;
}): Promise<void> {
  await request("/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// ── Report Downloads ──────────────────────────────────────────────────

async function downloadBlob(endpoint: string, body: unknown, fallbackName: string) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error al generar reporte" }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const filename = disposition?.match(/filename=(.+)/)?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadStructurePdf(data: {
  sequence: string;
  length: number;
  pdb_content: string;
  uniprot_id?: string;
  gene?: string;
  organism?: string;
  confidence?: number;
  source?: string;
}) {
  await downloadBlob("/reports/structure/pdf", data, "bioai_estructura.pdf");
}

export async function downloadAnalysisPdf(data: {
  sequence: string;
  length: number;
  molecular_weight: number;
  isoelectric_point: number;
  gravy: number;
  aromaticity?: number;
  instability_index?: number;
  composition?: { counts: Record<string, number>; percentages: Record<string, number> };
}) {
  await downloadBlob("/reports/analysis/pdf", data, "bioai_analisis.pdf");
}
