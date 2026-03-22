"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Route, Search, ExternalLink } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  searchKEGG,
  getKEGGPathway,
  type KEGGSearchResult,
  type KEGGPathway,
} from "@/lib/api";

export default function KEGGPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("pathway");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KEGGSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<KEGGPathway | null>(
    null
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedPathway(null);
    try {
      const data = await searchKEGG(query.trim(), category);
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error en la busqueda KEGG."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewPathway = async (pathwayId: string) => {
    setLoadingDetail(true);
    try {
      const data = await getKEGGPathway(pathwayId);
      setSelectedPathway(data);
    } catch {
      setSelectedPathway(null);
    } finally {
      setLoadingDetail(false);
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
            KEGG Pathways
          </h1>
          <p className="text-sm text-muted">
            Explora rutas metabolicas y genes en la base de datos KEGG.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label
                htmlFor="kegg-query"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Buscar
              </label>
              <input
                id="kegg-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="hemoglobin, glycolysis, BRCA1..."
                className="w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted/40 transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
              />
            </div>
            <div>
              <label
                htmlFor="kegg-category"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Categoria
              </label>
              <select
                id="kegg-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
              >
                <option value="pathway">Pathways</option>
                <option value="genes">Genes</option>
                <option value="compound">Compuestos</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || query.trim().length < 2}
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={16} aria-hidden="true" />
            Buscar en KEGG
          </button>

          {loading && <LoadingSpinner message="Buscando en KEGG..." />}

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
              <p className="text-sm text-muted">
                {results.total} resultados para &quot;{results.query}&quot;
              </p>

              {results.results.length === 0 ? (
                <p className="text-sm text-muted">No se encontraron resultados.</p>
              ) : (
                <div className="space-y-2">
                  {results.results.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/10">
                        <Route size={16} className="text-teal" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-medium text-teal-dark">
                          {entry.id}
                        </p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {entry.description}
                        </p>
                      </div>
                      {category === "pathway" && (
                        <button
                          onClick={() => handleViewPathway(entry.id)}
                          className="shrink-0 rounded-lg bg-teal/10 px-3 py-1.5 text-xs font-medium text-teal-dark transition-colors hover:bg-teal/20"
                        >
                          Ver detalle
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {loadingDetail && <LoadingSpinner message="Cargando pathway..." />}

          {selectedPathway && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <h3 className="mb-1 text-lg font-bold text-foreground">
                {selectedPathway.name || selectedPathway.id}
              </h3>
              {selectedPathway.definition && (
                <p className="mb-3 text-sm text-muted">
                  {selectedPathway.definition}
                </p>
              )}
              {selectedPathway.class && (
                <p className="mb-2 text-xs text-muted">
                  Clase: {selectedPathway.class}
                </p>
              )}
              {selectedPathway.image_url && (
                <div className="mt-4">
                  <a
                    href={selectedPathway.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-dark hover:underline"
                  >
                    <ExternalLink size={14} />
                    Ver mapa del pathway
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
