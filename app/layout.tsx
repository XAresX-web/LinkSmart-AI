import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers"; // <-- agrega esto

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EnlaceHub - Tu página de enlaces personalizada",
  description:
    "Crea una página de enlaces hermosa y funcional para compartir todos tus perfiles sociales y sitios web en un solo lugar.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
