"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { interpretResults, type AIInterpretation } from "@/lib/api";

const INDUSTRIES = [
  { value: "acuicultura", label: "Acuicultura" },
  { value: "mineria", label: "Mineria" },
  { value: "alimentos", label: "Alimentos" },
  { value: "farmaceutica", label: "Farmaceutica" },
  { value: "cosmetica", label: "Cosmetica" },
  { value: "investigacion", label: "Investigacion" },
];

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-5 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed text-foreground/80">$1</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function InterpretacionPage() {
  const [resultText, setResultText] = useState("");
  const [industry, setIndustry] = useState("acuicultura");
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInterpret = async () => {
    if (resultText.trim().length < 10) return;
    setLoading(true);
    setError(null);
    setInterpretation(null);
    try {
      const data = await interpretResults(resultText.trim(), industry);
      setInterpretation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al interpretar los resultados.");
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
            Interpretacion con IA
          </h1>
          <p className="text-sm text-muted">
            Pega tus resultados bioinformaticos y obtiene una interpretacion contextualizada para tu industria.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="results-input" className="mb-2 block text-sm font-semibold text-foreground">
              Resultados a interpretar
            </label>
            <textarea
              id="results-input"
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              placeholder="Pega aqui tus resultados de analisis de secuencias, prediccion de estructura u otros datos bioinformaticos..."
              rows={8}
              className="w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted/40 transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15 resize-y"
            />
          </div>

          <div>
            <label htmlFor="industry-select" className="mb-2 block text-sm font-semibold text-foreground">
              Contexto de industria
            </label>
            <select
              id="industry-select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/15"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleInterpret}
            disabled={loading || resultText.trim().length < 10}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BrainCircuit size={16} aria-hidden="true" />
            Interpretar con IA
          </button>

          {loading && <LoadingSpinner message="Generando interpretacion con IA..." />}

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {interpretation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 border-b border-border/40 bg-accent/[0.03] px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Sparkles size={16} className="text-accent" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Interpretacion IA</h2>
                  <p className="text-xs text-muted">
                    {INDUSTRIES.find((i) => i.value === interpretation.industry)?.label || interpretation.industry}
                  </p>
                </div>
              </div>
              {/* Content */}
              <div
                className="px-6 py-5 text-sm leading-relaxed text-foreground/85"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(interpretation.interpretation) }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
