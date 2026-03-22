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
      className={`card-hover rounded-xl p-5 bg-white ${className}`}
    >
      <h3
        className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#0891B2" }}
      >
        {title}
      </h3>
      {value !== undefined && (
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#0F172A" }}
        >
          {value}
        </p>
      )}
      {children}
    </motion.div>
  );
}
