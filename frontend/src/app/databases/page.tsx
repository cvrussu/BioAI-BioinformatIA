"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Search,
  ExternalLink,
  Dna,
  Crosshair,
  Pill,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  searchClinVar,
  searchOMIM,
  searchOpenTargets,
  getOpenTargetsAssociations,
  searchDrugs,
  type ClinVarResult,
  type OMIMResult,
  type OpenTargetsSearchResult,
  type OpenTargetsAssociationsResult,
  type DrugSearchResult,
} from "@/lib/api";

type Tab = "clinvar" | "omim" | "opentargets" | "drugs";

const TABS: { id: Tab; label: string; icon: typeof Database }[] = [
  { id: "clinvar", label: "ClinVar", icon: Dna },
  { id: "omim", label: "OMIM", icon: Database },
  { id: "opentargets", label: "OpenTargets", icon: Crosshair },
  { id: "drugs", label: "Farmacos", icon: Pill },
];

export default function DatabasesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("clinvar");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clinvar, setClinvar] = useState<ClinVarResult | null>(null);
  const [omim, setOmim] = useState<OMIMResult | null>(null);
  const [otResults, setOtResults] = useState<OpenTargetsSearchResult | null>(null);
  const [otAssociations, setOtAssociations] = useState<OpenTargetsAssociationsResult | null>(null);
  const [drugs, setDrugs] = useState<DrugSearchResult | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setOtAssociations(null);
    try {
      switch (activeTab) {
        case "clinvar": {
          const r = await searchClinVar(query.trim());
          setClinvar(r);
          break;
        }
        case "omim": {
          const r = await searchOMIM(query.trim());
          setOmim(r);
          break;
        }
        case "opentargets": {
          const r = await searchOpenTargets(query.trim());
          setOtResults(r);
          break;
        }
        case "drugs": {
          const r = await searchDrugs(query.trim());
          setDrugs(r);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la busqueda.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTAssociations = async (targetId: string) => {
    try {
      const r = await getOpenTargetsAssociations(targetId);
      setOtAssociations(r);
    } catch {
      // silently fail
    }
  };

  const placeholderMap: Record<Tab, string> = {
    clinvar: "BRCA1, rs28897743, cancer mama...",
    omim: "Huntington, CFTR, diabetes...",
    opentargets: "TP53, EGFR, insulin...",
    drugs: "aspirin, ibuprofen, metformin...",
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
            Bases de Datos Biomedicas
          </h1>
          <p className="text-sm text-muted">
            Consulta ClinVar, OMIM, OpenTargets y ChEMBL desde un solo lugar.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="mb-6 inline-flex flex-wrap rounded-xl border border-border/60 bg-white p-1 shadow-sm"
          role="tablist"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
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

        {/* Search bar */}
        <div className="space-y-5">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={placeholderMap[activeTab]}
              className="flex-1 rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted/40 transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
            />
            <button
              onClick={handleSearch}
              disabled={loading || query.trim().length < 2}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={16} aria-hidden="true" />
              Buscar
            </button>
          </div>

          {loading && <LoadingSpinner message="Buscando..." />}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ClinVar */}
            {activeTab === "clinvar" && clinvar && (
              <motion.div
                key="clinvar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <p className="text-sm text-muted">{clinvar.total} resultados</p>
                {clinvar.results.map((v) => (
                  <div
                    key={v.uid}
                    className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {v.title}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                          {v.gene && <span>Gen: <strong>{v.gene}</strong></span>}
                          {v.clinical_significance && (
                            <span
                              className={`rounded-md px-2 py-0.5 font-medium ${
                                v.clinical_significance.toLowerCase().includes("pathogenic")
                                  ? "bg-red-50 text-red-700"
                                  : v.clinical_significance.toLowerCase().includes("benign")
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {v.clinical_significance}
                            </span>
                          )}
                          {v.condition && <span>Condicion: {v.condition}</span>}
                        </div>
                      </div>
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-teal-dark hover:text-teal"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* OMIM */}
            {activeTab === "omim" && omim && (
              <motion.div
                key="omim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <p className="text-sm text-muted">{omim.total} resultados</p>
                {omim.results.map((entry) => (
                  <div
                    key={entry.uid}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-mono text-xs text-teal-dark">
                        MIM #{entry.mim_number}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {entry.title}
                      </p>
                    </div>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-teal-dark hover:text-teal"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </motion.div>
            )}

            {/* OpenTargets */}
            {activeTab === "opentargets" && otResults && (
              <motion.div
                key="opentargets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted">
                  {otResults.total} targets encontrados
                </p>
                <div className="space-y-2">
                  {otResults.results.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {t.symbol || t.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted line-clamp-2">
                            {t.description}
                          </p>
                          {t.biotype && (
                            <span className="mt-1 inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                              {t.biotype}
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => handleOTAssociations(t.id)}
                            className="rounded-lg bg-teal/10 px-3 py-1.5 text-xs font-medium text-teal-dark transition-colors hover:bg-teal/20"
                          >
                            Asociaciones
                          </button>
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-dark hover:text-teal"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {otAssociations && otAssociations.associations.length > 0 && (
                  <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/70">
                      Asociaciones Gen-Enfermedad
                    </h3>
                    <div className="space-y-2">
                      {otAssociations.associations.map((a) => (
                        <div
                          key={a.disease_id}
                          className="flex items-center justify-between rounded-lg bg-gray-50/50 px-3 py-2"
                        >
                          <span className="text-sm text-foreground">
                            {a.disease_name}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-teal"
                                style={{ width: `${a.score * 100}%` }}
                              />
                            </div>
                            <span className="w-12 text-right font-mono text-xs text-muted">
                              {(a.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Drugs / ChEMBL */}
            {activeTab === "drugs" && drugs && (
              <motion.div
                key="drugs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <p className="text-sm text-muted">{drugs.total} farmacos</p>
                {drugs.results.length === 0 ? (
                  <p className="text-sm text-muted">No se encontraron resultados.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/40 bg-gray-50/50">
                          <th className="px-4 py-3 font-semibold text-muted/70">Nombre</th>
                          <th className="px-4 py-3 font-semibold text-muted/70">Tipo</th>
                          <th className="px-4 py-3 font-semibold text-muted/70 text-center">
                            Fase
                          </th>
                          <th className="px-4 py-3 font-semibold text-muted/70 text-right">
                            MW
                          </th>
                          <th className="px-4 py-3 font-semibold text-muted/70" />
                        </tr>
                      </thead>
                      <tbody>
                        {drugs.results.map((d) => (
                          <tr
                            key={d.chembl_id}
                            className="border-b border-border/20 transition-colors hover:bg-teal/[0.02]"
                          >
                            <td className="px-4 py-3 font-medium text-foreground">
                              {d.name}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted">
                              {d.molecule_type || "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                                  d.max_phase >= 4
                                    ? "bg-green-50 text-green-700"
                                    : d.max_phase >= 2
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-gray-50 text-gray-600"
                                }`}
                              >
                                Fase {d.max_phase}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">
                              {d.molecular_weight || "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={d.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-dark hover:text-teal"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
