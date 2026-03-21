"use client";

import { useEffect, useRef } from "react";
import { Box } from "lucide-react";

interface MolstarViewerProps {
  pdbData?: string;
  className?: string;
}

export default function MolstarViewer({
  pdbData,
  className = "",
}: MolstarViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdbData || !containerRef.current) return;

    let cancelled = false;

    (async () => {
      // Dynamic import — 3Dmol requires browser environment
      const $3Dmol = await import("3dmol");

      if (cancelled || !containerRef.current) return;

      // Clear previous content
      containerRef.current.innerHTML = "";

      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: "0xf8fafc",
        antialias: true,
      });

      viewer.addModel(pdbData, "pdb");
      viewer.setStyle({}, { cartoon: { color: "spectrum" } });
      viewer.zoomTo();
      viewer.render();
      viewer.zoom(0.9);
    })();

    return () => {
      cancelled = true;
    };
  }, [pdbData]);

  if (!pdbData) {
    return (
      <div
        className={`relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-teal/[0.03] ${className}`}
        role="img"
        aria-label="Visualizador de estructura 3D de proteina"
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.06]">
            <Box size={28} className="text-primary/30" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground/70">
              Visualizador 3D
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Envia una secuencia para predecir y visualizar la estructura 3D.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[450px] w-full overflow-hidden rounded-2xl border border-border/60 shadow-sm ${className}`}
      role="img"
      aria-label="Visualizador de estructura 3D de proteina"
      style={{ position: "relative" }}
    />
  );
}
