"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Box,
  BarChart3,
  BrainCircuit,
  Menu,
  X,
  Dna,
  ChevronRight,
  LogOut,
  User,
  Search,
  Scissors,
  Route,
  Database,
} from "lucide-react";
import { useUser } from "./AuthProvider";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/estructura", label: "Estructura 3D", icon: Box },
  { href: "/analisis", label: "Analisis", icon: BarChart3 },
  { href: "/blast", label: "BLAST", icon: Search },
  { href: "/primers", label: "Primers", icon: Scissors },
  { href: "/kegg", label: "KEGG Pathways", icon: Route },
  { href: "/databases", label: "Bases de Datos", icon: Database },
  { href: "/interpretacion", label: "Interpretacion IA", icon: BrainCircuit },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useUser();

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-sidebar/95 px-4 backdrop-blur-md md:hidden">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/20">
            <Dna size={18} className="text-teal-light" />
          </div>
          <span className="text-lg font-bold tracking-tight">BioAI</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-sidebar text-white transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navegacion principal"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-dark shadow-lg shadow-teal/20">
            <Dna size={20} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">BioAI</span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
              Bioinformatica
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/[0.06]" />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Herramientas
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white/90"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-teal/20 text-teal-light"
                      : "bg-white/[0.04] text-white/40 group-hover:bg-white/[0.08] group-hover:text-white/70"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-white/30" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info & Footer */}
        <div className="border-t border-white/[0.06] px-5 py-4 space-y-3">
          {user && (
            <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/20">
                  <User size={14} className="text-teal-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-white/70">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-white/35">
                    {user.organization}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1.5 text-[10px] font-medium text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/60"
              >
                <LogOut size={12} />
                Cerrar sesion
              </button>
            </div>
          )}
          <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
            <p className="text-[11px] font-medium text-white/50">
              ScienSolutions SpA
            </p>
            <p className="text-[10px] text-white/25">Santiago, Chile</p>
          </div>
        </div>
      </aside>
    </>
  );
}
