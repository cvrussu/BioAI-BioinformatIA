"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export default function LoadingSpinner({
  message = "Procesando...",
  size = 28,
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-teal/10 bg-teal/[0.03] px-5 py-4">
      <Loader2
        size={size}
        className="animate-spin text-teal"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-teal-dark" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
