"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FlaskConical } from "lucide-react";
import SequenceInput from "@/components/SequenceInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultCard from "@/components/ResultCard";
import AminoAcidChart from "@/components/AminoAcidChart";
import { analyzeSequence, downloadAnalysisPdf, type SequenceAnalysis } from "@/lib/api";

export default function AnalisisPage() {
  const [sequence, setSequence] = useState("");
  const [seqType, setSeqType] = useState<"protein" | "dna">("protein");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SequenceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const clean = sequence.replace(/\s/g, "");
    if (clean.length < 3) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await analyzeSequence(clean);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar la secuencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Analisis de Secuencias
          </h1>
          <p className="text-sm text-muted">
            Analiza propiedades fisicoquimicas de secuencias de proteinas.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="seq-type" className="mb-2 block text-sm font-semibold text-foreground">
              Tipo de secuencia
            </label>
            <select
              id="seq-type"
              value={seqType}
              onChange={(e) => setSeqType(e.target.value as "protein" | "dna")}
              className="rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
            >
              <option value="protein">Proteina</option>
              <option value="dna" disabled>ADN (proximamente)</option>
            </select>
          </div>

          <SequenceInput value={sequence} onChange={setSequence} label="Secuencia de aminoacidos" type={seqType} />

          <button
            onClick={handleAnalyze}
            disabled={loading || sequence.replace(/\s/g, "").length < 3}
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FlaskConical size={16} aria-hidden="true" />
            Analizar
          </button>

          {loading && <LoadingSpinner message="Analizando secuencia..." />}

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard title="Longitud" value={results.length} />
                <ResultCard title="Peso Molecular" value={`${results.molecular_weight.toFixed(1)} Da`} />
                <ResultCard title="Punto Isoelectrico" value={results.isoelectric_point.toFixed(2)} />
                <ResultCard title="Hidrofobicidad" value={results.gravy.toFixed(3)} />
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted/70">
                  Composicion de Aminoacidos
                </h3>
                <AminoAcidChart composition={results.composition ?? {}} />
              </div>

              <button
                onClick={() =>
                  downloadAnalysisPdf({
                    sequence: sequence.replace(/\s/g, ""),
                    length: results.length,
                    molecular_weight: results.molecular_weight,
                    isoelectric_point: results.isoelectric_point,
                    gravy: results.gravy,
                    composition: results.composition,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 px-5 py-2.5 text-sm font-medium text-teal-dark shadow-sm transition-all hover:bg-teal/10 hover:shadow-md"
              >
                <FileText size={16} aria-hidden="true" />
                Descargar Reporte PDF
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
