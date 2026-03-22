"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import SequenceInput from "@/components/SequenceInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { designPrimers, type PrimerDesignResult } from "@/lib/api";

export default function PrimersPage() {
  const [sequence, setSequence] = useState("");
  const [targetStart, setTargetStart] = useState(0);
  const [targetLength, setTargetLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PrimerDesignResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDesign = async () => {
    const clean = sequence.replace(/\s/g, "");
    if (clean.length < 20) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await designPrimers({
        sequence: clean,
        target_start: targetStart || undefined,
        target_length: targetLength || undefined,
      });
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error en el diseño de primers."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Diseño de Primers
          </h1>
          <p className="text-sm text-muted">
            Diseña primers PCR usando Primer3. Ingresa una secuencia de ADN
            template y opcionalmente define la region target.
          </p>
        </div>

        <div className="space-y-5">
          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label="Secuencia de ADN template"
            placeholder="ATGGCTAGCGATTCGATCGATCGATCGATCGATCGATCGATCG..."
            type="dna"
          />

          <div className="flex flex-wrap gap-4">
            <div>
              <label
                htmlFor="target-start"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Inicio del target (opcional)
              </label>
              <input
                id="target-start"
                type="number"
                min={0}
                value={targetStart}
                onChange={(e) => setTargetStart(Number(e.target.value))}
                className="w-32 rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
              />
            </div>
            <div>
              <label
                htmlFor="target-length"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Longitud del target (opcional)
              </label>
              <input
                id="target-length"
                type="number"
                min={0}
                value={targetLength}
                onChange={(e) => setTargetLength(Number(e.target.value))}
                className="w-32 rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
              />
            </div>
          </div>

          <p className="text-xs text-muted">
            Si no defines la region target, se usara el tercio central de la secuencia.
          </p>

          <button
            onClick={handleDesign}
            disabled={loading || sequence.replace(/\s/g, "").length < 20}
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Scissors size={16} aria-hidden="true" />
            Diseñar Primers
          </button>

          {loading && <LoadingSpinner message="Diseñando primers..." />}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-4 text-sm text-muted">
                <span>
                  Longitud secuencia: <strong>{results.sequence_length} nt</strong>
                </span>
                <span>
                  Region target: <strong>{results.target_start}-{results.target_start + results.target_length}</strong>
                </span>
                <span>
                  Pares encontrados: <strong>{results.num_returned}</strong>
                </span>
              </div>

              {results.primers.length === 0 ? (
                <p className="text-sm text-muted">
                  No se pudieron diseñar primers con los parametros dados. Intenta
                  con una secuencia mas larga o ajusta la region target.
                </p>
              ) : (
                <div className="space-y-3">
                  {results.primers.map((p) => (
                    <div
                      key={p.pair_index}
                      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">
                          Par #{p.pair_index + 1}
                        </h4>
                        <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-muted">
                          Producto: {p.product_size} bp
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-gray-50/50 p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
                            Forward (5&apos; → 3&apos;)
                          </p>
                          <p className="break-all font-mono text-xs text-foreground">
                            {p.forward_sequence}
                          </p>
                          <div className="mt-2 flex gap-3 text-[10px] text-muted">
                            <span>Tm: {p.forward_tm}°C</span>
                            <span>GC: {p.forward_gc_pct}%</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-gray-50/50 p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
                            Reverse (5&apos; → 3&apos;)
                          </p>
                          <p className="break-all font-mono text-xs text-foreground">
                            {p.reverse_sequence}
                          </p>
                          <div className="mt-2 flex gap-3 text-[10px] text-muted">
                            <span>Tm: {p.reverse_tm}°C</span>
                            <span>GC: {p.reverse_gc_pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
