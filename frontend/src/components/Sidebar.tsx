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
      <div
        className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 backdrop-blur-md md:hidden"
        style={{
          background: "rgba(255,255,255,0.92)",
          borderBottom: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, #0891B2, #22D3EE)",
              boxShadow: "0 2px 8px rgba(8,145,178,0.3)",
            }}
          >
            <Dna size={17} style={{ color: "#FFFFFF" }} />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: "#0F172A" }}>
            BioAI
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 transition-colors"
          style={{ color: "#64748B" }}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          style={{ background: "rgba(15,23,42,0.25)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid rgba(15,23,42,0.07)",
          boxShadow: "4px 0 24px rgba(15,23,42,0.04)",
        }}
        aria-label="Navegacion principal"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #0891B2, #22D3EE)",
              boxShadow: "0 4px 12px rgba(8,145,178,0.28)",
            }}
          >
            <Dna size={19} style={{ color: "#FFFFFF" }} />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight" style={{ color: "#0F172A" }}>
              BioAI
            </span>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "#0891B2" }}
            >
              Bioinformatica
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mx-4 border-t"
          style={{ borderColor: "rgba(15,23,42,0.06)" }}
        />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          <p
            className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(100,116,139,0.55)" }}
          >
            Herramientas
          </p>
          {NAV_ITEMS.map((navItem) => {
            const isActive = pathname === navItem.href;
            const Icon = navItem.icon;
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200"
                style={{
                  background: isActive ? "rgba(8,145,178,0.08)" : "transparent",
                  color: isActive ? "#0891B2" : "#475569",
                  boxShadow: isActive ? "inset 2px 0 0 #0891B2" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(15,23,42,0.04)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0F172A";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#475569";
                  }
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  style={{
                    background: isActive
                      ? "rgba(8,145,178,0.12)"
                      : "rgba(15,23,42,0.05)",
                    color: isActive ? "#0891B2" : "#94A3B8",
                  }}
                >
                  <Icon size={15} aria-hidden="true" />
                </div>
                <span className="flex-1">{navItem.label}</span>
                {isActive && (
                  <ChevronRight
                    size={13}
                    style={{ color: "rgba(8,145,178,0.5)" }}
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info & Footer */}
        <div
          className="border-t px-4 py-4 space-y-2.5"
          style={{ borderColor: "rgba(15,23,42,0.06)" }}
        >
          {user && (
            <div
              className="rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(248,250,255,0.9)",
                border: "1px solid rgba(15,23,42,0.07)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(8,145,178,0.10)" }}
                >
                  <User size={13} style={{ color: "#0891B2" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[11px] font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    {user.name}
                  </p>
                  <p className="truncate text-[10px]" style={{ color: "#94A3B8" }}>
                    {user.organization}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors"
                style={{
                  background: "rgba(15,23,42,0.04)",
                  color: "#94A3B8",
                  border: "1px solid rgba(15,23,42,0.06)",
                }}
              >
                <LogOut size={11} />
                Cerrar sesion
              </button>
            </div>
          )}
          <div
            className="rounded-xl px-3 py-2.5"
            style={{
              background: "linear-gradient(135deg, rgba(8,145,178,0.05) 0%, rgba(124,58,237,0.04) 100%)",
              border: "1px solid rgba(8,145,178,0.10)",
            }}
          >
            <p className="text-[11px] font-semibold" style={{ color: "#0F172A" }}>
              ScienSolutions SpA
            </p>
            <p className="text-[10px]" style={{ color: "#94A3B8" }}>
              Santiago, Chile
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
