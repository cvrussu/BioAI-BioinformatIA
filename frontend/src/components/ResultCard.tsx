"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ResultCardProps {
  title: string;
  value?: string | number;
  children?: ReactNode;
  className?: string;
}

export default function ResultCard({
  title,
  value,
  children,
  className = "",
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted/70">
        {title}
      </h3>
      {value !== undefined && (
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      )}
      {children}
    </motion.div>
  );
}
