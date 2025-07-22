"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
// Agregar import de los providers
import { signInWithGoogle } from "./auth-providers";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data.user && !error) {
      // Crear perfil de usuario
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        username,
        full_name: fullName,
      });
    }

    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
