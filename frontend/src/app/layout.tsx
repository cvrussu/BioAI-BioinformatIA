import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioAI - Tu Bioinformatico con IA",
  description:
    "Plataforma de bioinformatica impulsada por inteligencia artificial. Prediccion de estructuras, analisis de secuencias e interpretacion con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-background text-foreground">
        <AuthProvider>
          <Sidebar />
          <div className="flex flex-1 flex-col pt-14 md:ml-64 md:pt-0">
            <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
            <footer className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted/60">
              BioAI &mdash; ScienSolutions SpA &mdash; Santiago, Chile
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
