// lib/auth-providers.tsx
"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/* -------------------------------- Helpers -------------------------------- */

function getRedirectUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  // Fallback en SSR/edge
  return `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/auth/callback`;
}

/**
 * Inicia flujo OAuth con Google. Redirige al usuario a Google y luego vuelve
 * a /auth/callback (mismo host actual o NEXT_PUBLIC_BASE_URL en SSR).
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getRedirectUrl(),
    },
  });
  if (error) {
    console.error("signInWithGoogle error:", error);
    throw error;
  }
  return data;
}

/* ------------------------------ Auth Context ------------------------------ */

type AuthContextValue = {
  user: User | null | undefined; // undefined = cargando, null = sin sesión
  session: Session | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null | undefined>(undefined);
  const [session, setSession] = React.useState<Session | null>(null);

  // Inicial: obtener sesión actual
  React.useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    // Escuchar cambios de auth (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("signOut error:", error);
    }
    setUser(null);
    setSession(null);
  }, []);

  // Nota: usamos la función exportada arriba para iniciar Google OAuth
  const handleSignInGoogle = React.useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      signOut: handleSignOut,
      signInWithGoogle: handleSignInGoogle,
    }),
    [user, session, handleSignOut, handleSignInGoogle]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------ Hook de uso ------------------------------- */

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (ctx === undefined) {
    // Si olvidaste envolver con <AuthProvider>, devolvemos un fallback seguro.
    return {
      user: undefined,
      session: null,
      signOut: async () => {},
      signInWithGoogle: async () => {
        console.warn(
          "useAuth(): App no envuelta en <AuthProvider>; intentando signInWithGoogle directo."
        );
        await signInWithGoogle();
      },
    };
  }
  return ctx;
}
