"use client";

import { Box, Layers } from "lucide-react";

interface MolstarViewerProps {
  pdbData?: string;
  className?: string;
}

export default function MolstarViewer({
  pdbData,
  className = "",
}: MolstarViewerProps) {
  const lineCount = pdbData ? pdbData.split("\n").length : 0;

  return (
    <div
      id="molstar-viewer"
      className={`relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-teal/[0.03] ${className}`}
      role="img"
      aria-label="Visualizador de estructura 3D de proteina"
    >
      {/* Decorative dots */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.06]">
          {pdbData ? (
            <Layers size={28} className="text-primary/50" aria-hidden="true" />
          ) : (
            <Box size={28} className="text-primary/30" aria-hidden="true" />
          )}
        </div>

        <div>
          <p className="text-base font-semibold text-foreground/70">
            {pdbData ? "Estructura cargada" : "Visualizador 3D"}
          </p>
          {pdbData ? (
            <p className="mt-1 max-w-xs text-sm text-muted">
              {lineCount.toLocaleString()} lineas PDB procesadas.
              <br />
              <span className="text-xs">
                Integracion Mol* disponible proximamente.
              </span>
            </p>
          ) : (
            <p className="mt-1 max-w-xs text-sm text-muted">
              Envia una secuencia para predecir y visualizar la estructura 3D.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
