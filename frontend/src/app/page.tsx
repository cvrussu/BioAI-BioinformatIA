"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Box,
  BarChart3,
  BrainCircuit,
  ArrowRight,
  Dna,
  Zap,
  Globe,
  Shield,
  FileText,
  Download,
  Beaker,
  Microscope,
  Pill,
  Leaf,
  GraduationCap,
  FlaskConical,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const FEATURES = [
  {
    title: "Prediccion de Estructura 3D",
    description:
      "Predice la estructura 3D de proteinas con ESMFold o busca en AlphaFold DB. Visualiza resultados interactivamente con Mol*.",
    icon: Box,
    href: "/estructura",
    iconBg: "rgba(59, 130, 246, 0.10)",
    iconColor: "#3B82F6",
    borderHover: "rgba(59,130,246,0.20)",
  },
  {
    title: "Analisis Fisicoquimico",
    description:
      "Calcula peso molecular, punto isoelectrico, composicion de aminoacidos, hidrofobicidad GRAVY y mas propiedades de tus secuencias.",
    icon: BarChart3,
    href: "/analisis",
    iconBg: "rgba(8, 145, 178, 0.10)",
    iconColor: "#0891B2",
    borderHover: "rgba(8,145,178,0.20)",
  },
  {
    title: "Interpretacion con IA",
    description:
      "Obtiene interpretaciones en espanol de tus resultados, contextualizadas para tu industria especifica (biotecnologia, farmaceutica, etc).",
    icon: BrainCircuit,
    href: "/interpretacion",
    iconBg: "rgba(124, 58, 237, 0.10)",
    iconColor: "#7C3AED",
    borderHover: "rgba(124,58,237,0.20)",
  },
];

const STATS = [
  { icon: Zap,      label: "Sin GPU requerida",      desc: "Usa APIs en la nube" },
  { icon: Globe,    label: "Resultados en espanol",   desc: "Interpretaciones claras" },
  { icon: Shield,   label: "100% local",              desc: "Tus datos no salen" },
  { icon: FileText, label: "Reportes PDF",            desc: "Descarga tus resultados" },
];

const USE_CASES = [
  {
    icon: Pill,
    title: "Farmaceutica",
    example:
      "Modela la estructura de un target terapeutico con AlphaFold, analiza sus propiedades fisicoquimicas y obtiene un reporte PDF para tu equipo de drug discovery.",
  },
  {
    icon: Beaker,
    title: "Biotecnologia",
    example:
      "Predice la estructura de una enzima industrial con ESMFold, evalua su estabilidad con el indice de inestabilidad y comparte el archivo PDB con tu equipo de ingenieria de proteinas.",
  },
  {
    icon: Microscope,
    title: "Investigacion Biomedica",
    example:
      "Busca la estructura de una proteina de interes en AlphaFold DB usando su ID de UniProt, visualizala en 3D y genera una interpretacion con IA para tu publicacion.",
  },
  {
    icon: GraduationCap,
    title: "Docencia y Universidad",
    example:
      "Muestra a tus alumnos como predecir la estructura de la hemoglobina, analizar su composicion de aminoacidos y entender la relacion estructura-funcion con interpretaciones en espanol.",
  },
  {
    icon: Leaf,
    title: "Agronomia y Alimentos",
    example:
      "Analiza proteinas de interes agroindustrial: predice la estructura de alergenos alimentarios, evalua la hidrofobicidad de proteinas de semillas o caracteriza enzimas para bioprocesos.",
  },
  {
    icon: FlaskConical,
    title: "Control de Calidad",
    example:
      "Verifica la identidad de proteinas recombinantes comparando su peso molecular teorico, punto isoelectrico y composicion de aminoacidos con valores esperados.",
  },
];

const CAPABILITIES = [
  {
    icon: Box,
    title: "ESMFold",
    desc: "Prediccion de estructura 3D desde secuencia. No requiere alineamiento multiple — ideal para secuencias nuevas o no caracterizadas.",
    color: "#3B82F6",
  },
  {
    icon: Download,
    title: "AlphaFold DB",
    desc: "Acceso directo a la base de datos de AlphaFold con mas de 200M de estructuras predichas. Busca por ID de UniProt.",
    color: "#0891B2",
  },
  {
    icon: BarChart3,
    title: "Analisis de Secuencia",
    desc: "Peso molecular, pI, GRAVY, aromaticidad, indice de inestabilidad y composicion de aminoacidos completa.",
    color: "#0891B2",
  },
  {
    icon: BrainCircuit,
    title: "IA en Espanol",
    desc: "Interpretacion contextualizada de resultados usando modelos de lenguaje avanzados, adaptada a tu industria.",
    color: "#7C3AED",
  },
  {
    icon: FileText,
    title: "Reportes PDF",
    desc: "Genera reportes profesionales descargables con todos los resultados, tablas y datos de tu analisis.",
    color: "#0E7490",
  },
  {
    icon: Dna,
    title: "Visualizacion 3D",
    desc: "Visualiza estructuras de proteinas de forma interactiva con el visor molecular Mol* directamente en el navegador.",
    color: "#0891B2",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl">

      {/* ============================================================
          HERO
          ============================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative py-16 text-center lg:py-24 overflow-hidden"
      >
        {/* Light mesh gradient background */}
        <div className="hero-mesh rounded-3xl" />

        {/* Hero image overlay — DNA illustration */}
        <div className="hero-image-bg rounded-3xl" />

        {/* Radial glow orbs */}
        <div className="hero-glow" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-7 badge-cyan"
        >
          <Dna size={15} aria-hidden="true" />
          Plataforma de Bioinformatica con IA
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hero-title mb-5"
          style={{ color: "#0F172A" }}
        >
          Tu Bioinformatico
          <br />
          <span className="text-gradient">inteligente</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mx-auto max-w-xl text-base leading-relaxed sm:text-lg"
          style={{ color: "#64748B" }}
        >
          Analisis de proteinas, prediccion de estructuras e interpretacion
          de resultados con inteligencia artificial. Sin necesidad de experiencia en bioinformatica.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/estructura"
            className="btn-cyan inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm shadow-lg"
          >
            Comenzar ahora
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a
            href="#funcionalidades"
            className="btn-outline-dark inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium"
          >
            Ver funcionalidades
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-5"
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-badge flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(8,145,178,0.08)" }}
                >
                  <Icon size={15} style={{ color: "#0891B2" }} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-semibold" style={{ color: "#0F172A" }}>
                    {stat.label}
                  </p>
                  <p className="text-[11px]" style={{ color: "#94A3B8" }}>
                    {stat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ============================================================
          FEATURE CARDS (primary 3)
          ============================================================ */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.href} variants={item}>
              <Link
                href={feature.href}
                className="feature-card-glow card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 no-underline bg-white"
              >
                {/* Icon */}
                <div
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: feature.iconBg }}
                >
                  <Icon size={22} style={{ color: feature.iconColor }} aria-hidden="true" />
                </div>

                <h2
                  className="mb-2 text-[17px] font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {feature.title}
                </h2>

                <p
                  className="mb-5 flex-1 text-sm leading-relaxed"
                  style={{ color: "#64748B" }}
                >
                  {feature.description}
                </p>

                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
                  style={{ color: feature.iconColor }}
                >
                  Comenzar
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Section divider */}
      <div className="section-divider mb-16" />

      {/* ============================================================
          CAPABILITIES SECTION
          ============================================================ */}
      <section id="funcionalidades" className="pb-16">
        <AnimateOnScroll className="mb-10 text-center">
          <h2 className="section-title mb-3" style={{ color: "#0F172A" }}>
            Que puedes hacer con BioAI
          </h2>
          <p className="mx-auto max-w-lg text-sm" style={{ color: "#64748B" }}>
            Herramientas de bioinformatica de nivel profesional, accesibles desde tu navegador.
          </p>
        </AnimateOnScroll>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            const delay = (Math.min(i, 5) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
            return (
              <AnimateOnScroll key={cap.title} delay={delay}>
                <div className="card-hover h-full rounded-2xl p-5 bg-white">
                  <div
                    className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${cap.color}14` }}
                  >
                    <Icon size={20} style={{ color: cap.color }} aria-hidden="true" />
                  </div>
                  <h3
                    className="mb-1.5 text-sm font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    {cap.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                    {cap.desc}
                  </p>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider mb-16" />

      {/* ============================================================
          USE CASES SECTION
          ============================================================ */}
      <section className="pb-20">
        <AnimateOnScroll className="mb-10 text-center">
          <h2 className="section-title mb-3" style={{ color: "#0F172A" }}>
            Ejemplos de uso por industria
          </h2>
          <p className="mx-auto max-w-lg text-sm" style={{ color: "#64748B" }}>
            BioAI se adapta a tu contexto. Descubre como investigadores de distintas areas sacan el maximo provecho.
          </p>
        </AnimateOnScroll>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon;
            const delay = (Math.min(i, 5) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
            return (
              <AnimateOnScroll key={uc.title} delay={delay}>
                <div className="card-hover h-full rounded-2xl p-5 bg-white">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: "rgba(8,145,178,0.08)" }}
                    >
                      <Icon size={18} style={{ color: "#0891B2" }} aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                      {uc.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                    {uc.example}
                  </p>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <AnimateOnScroll className="pb-16 text-center">
        <div
          className="relative overflow-hidden rounded-2xl p-10"
          style={{
            background: "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 50%, #ECFDF5 100%)",
            border: "1px solid rgba(8,145,178,0.15)",
          }}
        >
          {/* Decorative orbs */}
          <div
            className="pointer-events-none absolute left-0 top-0 -translate-x-1/3 -translate-y-1/3"
            style={{
              width: "280px",
              height: "280px",
              background: "radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="pointer-events-none absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3"
            style={{
              width: "280px",
              height: "280px",
              background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          <h2 className="relative mb-3 text-xl font-bold sm:text-2xl" style={{ color: "#0F172A" }}>
            Listo para analizar tus proteinas?
          </h2>
          <p className="relative mx-auto mb-7 max-w-md text-sm" style={{ color: "#64748B" }}>
            Comienza prediciendo una estructura, analizando una secuencia o interpretando resultados con inteligencia artificial.
          </p>
          <Link
            href="/estructura"
            className="btn-cyan relative inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm"
          >
            Predecir mi primera estructura
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </AnimateOnScroll>

    </div>
  );
}
