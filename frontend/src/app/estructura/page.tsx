"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Search, Sparkles } from "lucide-react";
import SequenceInput from "@/components/SequenceInput";
import MolstarViewer from "@/components/MolstarViewer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultCard from "@/components/ResultCard";
import {
  predictStructure,
  lookupAlphaFold,
  downloadStructurePdf,
  type StructurePrediction,
  type AlphaFoldResult,
} from "@/lib/api";

type Tab = "esmfold" | "alphafold";

export default function EstructuraPage() {
  const [activeTab, setActiveTab] = useState<Tab>("esmfold");
  const [sequence, setSequence] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<StructurePrediction | null>(null);
  const [predError, setPredError] = useState<string | null>(null);
  const [uniprotId, setUniprotId] = useState("");
  const [searching, setSearching] = useState(false);
  const [alphaResult, setAlphaResult] = useState<AlphaFoldResult | null>(null);
  const [alphaError, setAlphaError] = useState<string | null>(null);

  const handlePredict = async () => {
    const clean = sequence.replace(/\s/g, "");
    if (clean.length < 10) return;
    setPredicting(true);
    setPredError(null);
    setPrediction(null);
    try {
      const result = await predictStructure(clean);
      setPrediction(result);
    } catch (err) {
      setPredError(err instanceof Error ? err.message : "Error al predecir la estructura.");
    } finally {
      setPredicting(false);
    }
  };

  const handleAlphaFold = async () => {
    if (!uniprotId.trim()) return;
    setSearching(true);
    setAlphaError(null);
    setAlphaResult(null);
    try {
      const result = await lookupAlphaFold(uniprotId.trim());
      setAlphaResult(result);
    } catch (err) {
      setAlphaError(err instanceof Error ? err.message : "Error al buscar en AlphaFold DB.");
    } finally {
      setSearching(false);
    }
  };

  const downloadPdb = (data: string, filename: string) => {
    const blob = new Blob([data], { type: "chemical/x-pdb" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Prediccion de Estructura
          </h1>
          <p className="text-sm text-muted">
            Predice estructuras 3D con ESMFold o busca en la base de datos de AlphaFold.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 inline-flex rounded-xl border border-border/60 bg-white p-1 shadow-sm" role="tablist">
          {[
            { id: "esmfold" as Tab, label: "ESMFold", icon: Sparkles },
            { id: "alphafold" as Tab, label: "AlphaFold DB", icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-foreground text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <AnimatePresence mode="wait">
          {activeTab === "esmfold" && (
            <motion.div
              key="esmfold"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              role="tabpanel"
              className="space-y-5"
            >
              <SequenceInput
                value={sequence}
                onChange={setSequence}
                label="Secuencia de aminoacidos"
                placeholder="MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH..."
                type="protein"
              />
              <button
                onClick={handlePredict}
                disabled={predicting || sequence.replace(/\s/g, "").length < 10}
                className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              >
                <Sparkles size={16} aria-hidden="true" />
                Predecir Estructura
              </button>

              {predicting && <LoadingSpinner message="Prediciendo estructura con ESMFold..." />}

              {predError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {predError}
                </div>
              )}

              {prediction && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {prediction.plddt_score !== undefined && (
                      <ResultCard title="Puntuacion pLDDT" value={prediction.plddt_score.toFixed(1)} />
                    )}
                    {prediction.sequence_length !== undefined && (
                      <ResultCard title="Longitud" value={prediction.sequence_length} />
                    )}
                  </div>
                  <MolstarViewer pdbData={prediction.pdb_data} />
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => downloadPdb(prediction.pdb_data, "prediccion_esmfold.pdb")}
                      className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-white px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                    >
                      <Download size={16} aria-hidden="true" />
                      Descargar PDB
                    </button>
                    <button
                      onClick={() =>
                        downloadStructurePdf({
                          sequence: sequence.replace(/\s/g, ""),
                          length: prediction.sequence_length ?? sequence.replace(/\s/g, "").length,
                          pdb_content: prediction.pdb_data,
                          confidence: prediction.plddt_score,
                          source: "ESMFold",
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 px-5 py-2.5 text-sm font-medium text-teal-dark shadow-sm transition-all hover:bg-teal/10 hover:shadow-md"
                    >
                      <FileText size={16} aria-hidden="true" />
                      Descargar Reporte PDF
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "alphafold" && (
            <motion.div
              key="alphafold"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              role="tabpanel"
              className="space-y-5"
            >
              <div>
                <label htmlFor="uniprot-id" className="mb-2 block text-sm font-semibold text-foreground">
                  ID de UniProt
                </label>
                <input
                  id="uniprot-id"
                  type="text"
                  value={uniprotId}
                  onChange={(e) => setUniprotId(e.target.value.toUpperCase())}
                  placeholder="P00533"
                  className="w-full max-w-xs rounded-xl border border-border/80 bg-white px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/40 transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
                />
              </div>
              <button
                onClick={handleAlphaFold}
                disabled={searching || !uniprotId.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-light hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={16} aria-hidden="true" />
                Buscar Estructura
              </button>

              {searching && <LoadingSpinner message="Buscando en AlphaFold DB..." />}

              {alphaError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {alphaError}
                </div>
              )}

              {alphaResult && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <ResultCard title="UniProt ID" value={alphaResult.uniprot_id} />
                    {alphaResult.protein_name && <ResultCard title="Proteina" value={alphaResult.protein_name} />}
                    {alphaResult.organism && <ResultCard title="Organismo" value={alphaResult.organism} />}
                    {alphaResult.gene_name && <ResultCard title="Gen" value={alphaResult.gene_name} />}
                  </div>
                  {alphaResult.pdb_data && <MolstarViewer pdbData={alphaResult.pdb_data} />}
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={alphaResult.pdb_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-white px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                    >
                      <Download size={16} aria-hidden="true" />
                      Descargar desde AlphaFold DB
                    </a>
                    {alphaResult.pdb_data && (
                      <button
                        onClick={() =>
                          downloadStructurePdf({
                            sequence: "",
                            length: alphaResult.pdb_data!.split("\n").length,
                            pdb_content: alphaResult.pdb_data!,
                            uniprot_id: alphaResult.uniprot_id,
                            gene: alphaResult.gene_name ?? undefined,
                            organism: alphaResult.organism ?? undefined,
                            source: "AlphaFold DB",
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 px-5 py-2.5 text-sm font-medium text-teal-dark shadow-sm transition-all hover:bg-teal/10 hover:shadow-md"
                      >
                        <FileText size={16} aria-hidden="true" />
                        Descargar Reporte PDF
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
