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

const FEATURES = [
  {
    title: "Prediccion de Estructura 3D",
    description:
      "Predice la estructura 3D de proteinas con ESMFold o busca en AlphaFold DB. Visualiza resultados interactivamente con Mol*.",
    icon: Box,
    href: "/estructura",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
  },
  {
    title: "Analisis Fisicoquimico",
    description:
      "Calcula peso molecular, punto isoelectrico, composicion de aminoacidos, hidrofobicidad GRAVY y mas propiedades de tus secuencias.",
    icon: BarChart3,
    href: "/analisis",
    gradient: "from-teal/10 via-teal/5 to-transparent",
    iconBg: "bg-teal/10",
    iconColor: "text-teal-dark",
    borderHover: "hover:border-teal-light/40",
  },
  {
    title: "Interpretacion con IA",
    description:
      "Obtiene interpretaciones en espanol de tus resultados, contextualizadas para tu industria especifica (biotecnologia, farmaceutica, etc).",
    icon: BrainCircuit,
    href: "/interpretacion",
    gradient: "from-accent/10 via-accent/5 to-transparent",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    borderHover: "hover:border-accent/30",
  },
];

const STATS = [
  { icon: Zap, label: "Sin GPU requerida", desc: "Usa APIs en la nube" },
  { icon: Globe, label: "Resultados en espanol", desc: "Interpretaciones claras" },
  { icon: Shield, label: "100% local", desc: "Tus datos no salen" },
  { icon: FileText, label: "Reportes PDF", desc: "Descarga tus resultados" },
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
  },
  {
    icon: Download,
    title: "AlphaFold DB",
    desc: "Acceso directo a la base de datos de AlphaFold con mas de 200M de estructuras predichas. Busca por ID de UniProt.",
  },
  {
    icon: BarChart3,
    title: "Analisis de Secuencia",
    desc: "Peso molecular, pI, GRAVY, aromaticidad, indice de inestabilidad y composicion de aminoacidos completa.",
  },
  {
    icon: BrainCircuit,
    title: "IA en Espanol",
    desc: "Interpretacion contextualizada de resultados usando modelos de lenguaje avanzados, adaptada a tu industria.",
  },
  {
    icon: FileText,
    title: "Reportes PDF",
    desc: "Genera reportes profesionales descargables con todos los resultados, tablas y datos de tu analisis.",
  },
  {
    icon: Dna,
    title: "Visualizacion 3D",
    desc: "Visualiza estructuras de proteinas de forma interactiva con el visor molecular Mol* directamente en el navegador.",
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
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-16 text-center lg:py-24"
      >
        <div className="absolute inset-0 -z-10 bg-grid opacity-50" />
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-teal/8 via-accent/5 to-transparent blur-3xl" />

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5 text-sm font-medium text-teal-dark">
          <Dna size={15} aria-hidden="true" />
          Plataforma de Bioinformatica con IA
        </div>

        <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Tu Bioinformatico
          <br />
          <span className="text-gradient">inteligente</span>
        </h1>

        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Analisis de proteinas, prediccion de estructuras e interpretacion
          de resultados con inteligencia artificial. Sin necesidad de experiencia en bioinformatica.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/estructura"
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md"
          >
            Comenzar ahora
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a
            href="#funcionalidades"
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-white px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
          >
            Ver funcionalidades
          </a>
        </div>

        {/* Quick stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/[0.04]">
                  <Icon size={16} className="text-muted" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Feature cards */}
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
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${feature.borderHover}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative">
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={22} className={feature.iconColor} aria-hidden="true" />
                  </div>
                  <h2 className="mb-2 text-[17px] font-semibold text-foreground">
                    {feature.title}
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-dark transition-all duration-200 group-hover:gap-2.5">
                    Comenzar
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Capabilities section */}
      <motion.section
        id="funcionalidades"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pb-16"
      >
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Que puedes hacer con BioAI
          </h2>
          <p className="mx-auto max-w-lg text-sm text-muted">
            Herramientas de bioinformatica de nivel profesional, accesibles desde tu navegador.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal/8">
                  <Icon size={20} className="text-teal-dark" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-foreground">{cap.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Use cases section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pb-20"
      >
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Ejemplos de uso por industria
          </h2>
          <p className="mx-auto max-w-lg text-sm text-muted">
            BioAI se adapta a tu contexto. Descubre como investigadores de distintas areas sacan el maximo provecho.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-teal/20"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
                    <Icon size={18} className="text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{uc.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-muted">{uc.example}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="pb-16 text-center"
      >
        <div className="rounded-2xl border border-teal/15 bg-gradient-to-br from-teal/5 via-transparent to-accent/5 p-10">
          <h2 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
            Listo para analizar tus proteinas?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted">
            Comienza prediciendo una estructura, analizando una secuencia o interpretando resultados con inteligencia artificial.
          </p>
          <Link
            href="/estructura"
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-dark hover:shadow-md"
          >
            Predecir mi primera estructura
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
