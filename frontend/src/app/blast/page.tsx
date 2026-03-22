"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle } from "lucide-react";
import SequenceInput from "@/components/SequenceInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { blastSearch, type BlastResult } from "@/lib/api";

export default function BlastPage() {
  const [sequence, setSequence] = useState("");
  const [program, setProgram] = useState("blastp");
  const [database, setDatabase] = useState("nr");
  const [maxHits, setMaxHits] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BlastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const clean = sequence.replace(/\s/g, "");
    if (clean.length < 5) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await blastSearch({
        sequence: clean,
        program,
        database,
        max_hits: maxHits,
      });
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error en la busqueda BLAST."
      );
    } finally {
      setLoading(false);
    }
  };

  const seqType = program === "blastn" ? "dna" : "protein";

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Busqueda BLAST
          </h1>
          <p className="text-sm text-muted">
            Busca secuencias homologas en las bases de datos de NCBI.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-4">
            <div>
              <label
                htmlFor="blast-program"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Programa
              </label>
              <select
                id="blast-program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
              >
                <option value="blastp">blastp (proteina vs proteina)</option>
                <option value="blastn">blastn (ADN vs ADN)</option>
                <option value="blastx">blastx (ADN traducido vs proteina)</option>
                <option value="tblastn">tblastn (proteina vs ADN traducido)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="blast-db"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Base de datos
              </label>
              <select
                id="blast-db"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
              >
                <option value="nr">nr (no redundante)</option>
                <option value="swissprot">SwissProt</option>
                <option value="pdb">PDB</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="max-hits"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Max hits
              </label>
              <select
                id="max-hits"
                value={maxHits}
                onChange={(e) => setMaxHits(Number(e.target.value))}
                className="rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <SequenceInput
            value={sequence}
            onChange={setSequence}
            label={seqType === "protein" ? "Secuencia de aminoacidos" : "Secuencia de ADN"}
            type={seqType}
          />

          <div className="flex items-center gap-4">
            <button
              onClick={handleSearch}
              disabled={loading || sequence.replace(/\s/g, "").length < 5}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={16} aria-hidden="true" />
              Buscar
            </button>
            {!loading && !results && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertTriangle size={14} />
                <span>BLAST puede tardar 30s - 3 min</span>
              </div>
            )}
          </div>

          {loading && (
            <LoadingSpinner message="Ejecutando BLAST en NCBI... esto puede tardar varios minutos." />
          )}

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
              <div className="flex items-center gap-3 text-sm text-muted">
                <span>
                  Programa: <strong>{results.program}</strong>
                </span>
                <span>
                  BD: <strong>{results.database}</strong>
                </span>
                <span>
                  Hits: <strong>{results.total_hits}</strong>
                </span>
              </div>

              {results.hits.length === 0 ? (
                <p className="text-sm text-muted">
                  No se encontraron hits significativos.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-gray-50/50">
                        <th className="px-4 py-3 font-semibold text-muted/70">
                          Accession
                        </th>
                        <th className="px-4 py-3 font-semibold text-muted/70">
                          Descripcion
                        </th>
                        <th className="px-4 py-3 font-semibold text-muted/70 text-right">
                          Score
                        </th>
                        <th className="px-4 py-3 font-semibold text-muted/70 text-right">
                          E-value
                        </th>
                        <th className="px-4 py-3 font-semibold text-muted/70 text-right">
                          Identidad
                        </th>
                        <th className="px-4 py-3 font-semibold text-muted/70 text-right">
                          Longitud
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.hits.map((hit, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/20 transition-colors hover:bg-teal/[0.02]"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-teal-dark">
                            {hit.accession}
                          </td>
                          <td className="max-w-xs truncate px-4 py-3 text-foreground">
                            {hit.title}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {hit.score.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {hit.e_value.toExponential(1)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {hit.identity_pct != null
                              ? `${hit.identity_pct.toFixed(1)}%`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {hit.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
