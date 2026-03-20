"use client";

import { AlertCircle, FileText } from "lucide-react";
import { useState, useCallback } from "react";

interface SequenceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: "protein" | "dna";
  rows?: number;
}

const VALID_PROTEIN = /^[ACDEFGHIKLMNPQRSTVWY\s\n]+$/i;
const VALID_DNA = /^[ACGT\s\n]+$/i;

export default function SequenceInput({
  value,
  onChange,
  placeholder = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH...",
  label = "Secuencia",
  type = "protein",
  rows = 6,
}: SequenceInputProps) {
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    (raw: string) => {
      const clean = raw.replace(/\s/g, "");
      if (clean.length === 0) {
        setError(null);
        return;
      }
      const regex = type === "protein" ? VALID_PROTEIN : VALID_DNA;
      if (!regex.test(clean)) {
        setError(
          type === "protein"
            ? "La secuencia contiene caracteres no validos para una proteina."
            : "La secuencia contiene caracteres no validos para ADN."
        );
      } else {
        setError(null);
      }
    },
    [type]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value.toUpperCase();
    onChange(v);
    validate(v);
  };

  const residueCount = value.replace(/\s/g, "").length;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor="sequence-input"
          className="text-sm font-semibold text-foreground"
        >
          {label}
        </label>
        {residueCount > 0 && !error && (
          <span className="flex items-center gap-1 rounded-md bg-foreground/[0.04] px-2 py-0.5 text-xs font-medium text-muted">
            <FileText size={11} aria-hidden="true" />
            {residueCount} residuos
          </span>
        )}
      </div>
      <textarea
        id="sequence-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
        className={`w-full rounded-xl border bg-white px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted/40 transition-all duration-200 resize-y focus:outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-border/80 focus:border-teal focus:ring-teal/15"
        }`}
        aria-describedby={error ? "sequence-error" : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <div
          id="sequence-error"
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm text-red-600"
        >
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}
