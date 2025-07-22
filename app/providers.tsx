"use client";

import * as React from "react";
import { AuthProvider } from "@/lib/auth"; // <-- asegúrate que exista este archivo con AuthProvider

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
