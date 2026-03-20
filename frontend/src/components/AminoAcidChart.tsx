"use client";

import { motion } from "framer-motion";

interface AminoAcidChartProps {
  composition: Record<string, number>;
}

const AA_COLORS: Record<string, string> = {
  A: "#2563eb",
  R: "#dc2626",
  N: "#16a34a",
  D: "#dc2626",
  C: "#eab308",
  E: "#dc2626",
  Q: "#16a34a",
  G: "#6b7280",
  H: "#8b5cf6",
  I: "#2563eb",
  L: "#2563eb",
  K: "#dc2626",
  M: "#eab308",
  F: "#2563eb",
  P: "#f97316",
  S: "#16a34a",
  T: "#16a34a",
  W: "#2563eb",
  Y: "#8b5cf6",
  V: "#2563eb",
};

export default function AminoAcidChart({ composition }: AminoAcidChartProps) {
  const entries = Object.entries(composition).sort((a, b) => b[1] - a[1]);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="space-y-1.5" role="list" aria-label="Composicion de aminoacidos">
      {entries.map(([aa, count], i) => {
        const pct = (count / maxVal) * 100;
        return (
          <div key={aa} className="flex items-center gap-2 text-sm" role="listitem">
            <span className="w-5 font-mono font-semibold text-foreground">
              {aa}
            </span>
            <div className="flex-1 h-5 rounded bg-gray-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                className="h-full rounded"
                style={{ backgroundColor: AA_COLORS[aa] || "#6b7280" }}
                aria-label={`${aa}: ${count}`}
              />
            </div>
            <span className="w-12 text-right font-mono text-xs text-muted">
              {typeof count === "number"
                ? count === 0 ? "0%" : `${count.toFixed(1)}%`
                : String(count)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
