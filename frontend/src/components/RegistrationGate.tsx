"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dna, ArrowRight, FlaskConical } from "lucide-react";

const INDUSTRIES = [
  "Biotecnologia",
  "Universidad / Investigacion",
  "Docencia",
  "Medicina",
  "Agronomia",
  "Farmaceutica",
  "Acuicultura",
  "Mineria",
  "Alimentos",
  "Cosmetica",
  "Veterinaria",
  "Medio Ambiente",
  "Ingenieria Genetica",
  "Biologia Molecular",
  "Otra",
];

export interface UserData {
  name: string;
  email: string;
  organization: string;
  industry: string;
  registeredAt: string;
}

interface RegistrationGateProps {
  onRegistered: (user: UserData) => void;
}

export default function RegistrationGate({ onRegistered }: RegistrationGateProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    industry: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const userData: UserData = {
      ...form,
      registeredAt: new Date().toISOString(),
    };

    try {
      // Save to localStorage immediately
      localStorage.setItem("bioai_user", JSON.stringify(userData));

      // POST to backend (non-blocking — don't fail registration if backend is down)
      try {
        const { registerUser } = await import("@/lib/api");
        await registerUser({
          name: form.name,
          email: form.email,
          organization: form.organization,
          industry: form.industry,
        });
      } catch {
        // Backend may not be available; registration still succeeds locally
        console.warn("No se pudo conectar con el backend para registrar usuario.");
      }

      onRegistered(userData);
    } catch {
      setError("Ocurrio un error. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    form.organization.trim() &&
    form.industry;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0d9488] p-4">
      {/* Animated background particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/[0.03]"
            style={{
              width: 200 + i * 80,
              height: 200 + i * 80,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 12}%`,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] shadow-lg shadow-teal-500/30"
            >
              <Dna size={32} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              BioAI
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Accede a la plataforma de bioinformatica mas avanzada de
              Latinoamerica
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40"
              >
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Dr. Maria Lopez"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#2dd4bf]/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#2dd4bf]/30"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40"
              >
                Correo electronico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="maria@universidad.cl"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#2dd4bf]/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#2dd4bf]/30"
              />
            </div>

            {/* Organizacion */}
            <div>
              <label
                htmlFor="organization"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40"
              >
                Empresa / Universidad
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                value={form.organization}
                onChange={handleChange}
                placeholder="Universidad de Chile"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#2dd4bf]/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#2dd4bf]/30"
              />
            </div>

            {/* Industria */}
            <div>
              <label
                htmlFor="industry"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40"
              >
                Industria de uso
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={form.industry}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#2dd4bf]/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#2dd4bf]/30"
              >
                <option value="" disabled className="bg-[#1e3a5f] text-white/50">
                  Selecciona una industria
                </option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-[#1e3a5f] text-white">
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-center text-xs text-red-400">{error}</p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={!isValid || submitting}
              whileHover={isValid && !submitting ? { scale: 1.02 } : {}}
              whileTap={isValid && !submitting ? { scale: 0.98 } : {}}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0f766e] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FlaskConical size={18} />
                </motion.div>
              ) : (
                <>
                  Acceder a BioAI
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] text-white/25">
            ScienSolutions SpA &mdash; Santiago, Chile
          </p>
        </div>
      </motion.div>
    </div>
  );
}
