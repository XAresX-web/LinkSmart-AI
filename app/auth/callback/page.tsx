"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth/login?error=oauth");
      } else {
        router.replace("/dashboard"); // O donde quieras redirigir
      }
    })();
  }, [router]);

  return <p>Procesando inicio de sesión...</p>;
}
