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
  sequence: string;
  length: number;
  pdb_content: string;
  message?: string;
}

export interface AlphaFoldResult {
  uniprot_id: string;
  gene?: string;
  organism?: string;
  pdb_url?: string;
  cif_url?: string;
  pae_image_url?: string;
  confidence_avg?: number;
  pdb_content?: string;
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

// ── BLAST ─────────────────────────────────────────────────────────────

export interface BlastHit {
  title: string;
  accession: string;
  length: number;
  e_value: number;
  score: number;
  identity_pct?: number;
  query_cover?: string;
}

export interface BlastResult {
  program: string;
  database: string;
  hits: BlastHit[];
  total_hits: number;
}

export async function blastSearch(params: {
  sequence: string;
  program?: string;
  database?: string;
  evalue?: number;
  max_hits?: number;
}): Promise<BlastResult> {
  return request<BlastResult>("/analysis/blast-search", {
    method: "POST",
    body: JSON.stringify({
      sequence: params.sequence,
      program: params.program || "blastp",
      database: params.database || "nr",
      evalue: params.evalue || 0.01,
      max_hits: params.max_hits || 10,
    }),
  });
}

// ── KEGG ──────────────────────────────────────────────────────────────

export interface KEGGEntry {
  id: string;
  description: string;
}

export interface KEGGSearchResult {
  query: string;
  category: string;
  results: KEGGEntry[];
  total: number;
}

export interface KEGGPathway {
  id: string;
  name?: string;
  definition?: string;
  class?: string;
  organism?: string;
  image_url?: string;
  raw?: string;
}

export async function searchKEGG(
  query: string,
  category: string = "pathway"
): Promise<KEGGSearchResult> {
  return request<KEGGSearchResult>(
    `/kegg/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
  );
}

export async function getKEGGPathway(
  pathwayId: string
): Promise<KEGGPathway> {
  return request<KEGGPathway>(`/kegg/pathway/${encodeURIComponent(pathwayId)}`);
}

// ── ClinVar ───────────────────────────────────────────────────────────

export interface ClinVarEntry {
  uid: string;
  title: string;
  gene: string;
  clinical_significance: string;
  condition: string;
  review_status: string;
  variation_type: string;
  accession: string;
  url: string;
}

export interface ClinVarResult {
  query: string;
  results: ClinVarEntry[];
  total: number;
}

export async function searchClinVar(query: string): Promise<ClinVarResult> {
  return request<ClinVarResult>(
    `/databases/clinvar/search?q=${encodeURIComponent(query)}`
  );
}

// ── OMIM ──────────────────────────────────────────────────────────────

export interface OMIMEntry {
  uid: string;
  title: string;
  mim_number: string;
  url: string;
}

export interface OMIMResult {
  query: string;
  results: OMIMEntry[];
  total: number;
}

export async function searchOMIM(query: string): Promise<OMIMResult> {
  return request<OMIMResult>(
    `/databases/omim/search?q=${encodeURIComponent(query)}`
  );
}

// ── OpenTargets ───────────────────────────────────────────────────────

export interface OpenTargetsEntry {
  id: string;
  name: string;
  symbol: string;
  description: string;
  biotype: string;
  url: string;
}

export interface OpenTargetsSearchResult {
  query: string;
  results: OpenTargetsEntry[];
  total: number;
}

export interface OpenTargetsAssociation {
  disease_id: string;
  disease_name: string;
  score: number;
  url: string;
}

export interface OpenTargetsAssociationsResult {
  target_id: string;
  associations: OpenTargetsAssociation[];
  total: number;
}

export async function searchOpenTargets(
  query: string
): Promise<OpenTargetsSearchResult> {
  return request<OpenTargetsSearchResult>(
    `/databases/opentargets/search?q=${encodeURIComponent(query)}`
  );
}

export async function getOpenTargetsAssociations(
  targetId: string
): Promise<OpenTargetsAssociationsResult> {
  return request<OpenTargetsAssociationsResult>(
    `/databases/opentargets/${encodeURIComponent(targetId)}/associations`
  );
}

// ── ChEMBL / Drugs ───────────────────────────────────────────────────

export interface DrugEntry {
  chembl_id: string;
  name: string;
  molecule_type: string;
  max_phase: number;
  first_approval?: number;
  oral: boolean;
  molecular_weight?: string;
  alogp?: string;
  hba?: number;
  hbd?: number;
  url: string;
}

export interface DrugSearchResult {
  query: string;
  results: DrugEntry[];
  total: number;
}

export async function searchDrugs(query: string): Promise<DrugSearchResult> {
  return request<DrugSearchResult>(
    `/databases/drugs/search?q=${encodeURIComponent(query)}`
  );
}

// ── Primer Design ────────────────────────────────────────────────────

export interface PrimerPair {
  pair_index: number;
  forward_sequence: string;
  reverse_sequence: string;
  forward_tm: number;
  reverse_tm: number;
  forward_gc_pct: number;
  reverse_gc_pct: number;
  product_size: number;
  penalty: number;
}

export interface PrimerDesignResult {
  sequence_length: number;
  target_start: number;
  target_length: number;
  num_returned: number;
  primers: PrimerPair[];
}

export async function designPrimers(params: {
  sequence: string;
  target_start?: number;
  target_length?: number;
  num_return?: number;
  opt_size?: number;
  opt_tm?: number;
}): Promise<PrimerDesignResult> {
  return request<PrimerDesignResult>("/analysis/primer-design", {
    method: "POST",
    body: JSON.stringify(params),
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
