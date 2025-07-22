"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// UI components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Mail,
  MapPin,
  ExternalLink,
  Share2,
  Heart,
  Eye,
} from "lucide-react";

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */
export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  description?: string | null;
  location?: string | null;
  theme?: string | null;
  dark_mode?: boolean | null;
  show_analytics?: boolean | null;
  show_branding?: boolean | null;
}

export interface LinkRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string | null; // name of lucide icon to render
  color: string | null; // tailwind gradient string, e.g. "from-purple-500 to-pink-500"
  position: number;
  active: boolean;
}

export interface LinkWithClicks extends LinkRow {
  clicks: number;
}

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */
export default function ProfilePage() {
  const params = useParams();
  // useParams() returns Record<string, string | string[]>
  const rawUsername = (params as any)?.username;
  const username = Array.isArray(rawUsername)
    ? rawUsername[0]
    : (rawUsername as string | undefined);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkWithClicks[]>([]);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [notFound, setNotFound] = useState(false);

  /* --------------------------------------------------------------
   * Load profile + links + analytics (single orchestrator)
   * -------------------------------------------------------------- */
  const loadProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);

    try {
      /* ---------------- Profile ---------------- */
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (profileError) {
        console.error("Error al cargar perfil:", profileError);
      }
      if (!profileData) {
        setNotFound(true);
        return;
      }
      setProfile(profileData as UserProfile);

      /* ---------------- Links ---------------- */
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("active", true)
        .order("position", { ascending: true });

      if (linksError) {
        console.error("Error al cargar links:", linksError);
      }

      let linksWithClicks: LinkWithClicks[] = [];
      if (linksData && linksData.length > 0) {
        linksWithClicks = await Promise.all(
          linksData.map(async (link) => {
            const { count, error: clicksError } = await supabase
              .from("link_clicks")
              .select("id", { count: "exact", head: true })
              .eq("link_id", link.id);
            if (clicksError) {
              console.error("Error al contar clics:", clicksError);
            }
            return {
              ...(link as LinkRow),
              clicks: count || 0,
            } as LinkWithClicks;
          })
        );
      }
      setLinks(linksWithClicks);

      /* ---------------- Analytics (optional) ---------------- */
      if (profileData.show_analytics) {
        const [
          { count: viewCount, error: viewErr },
          { count: likeCount, error: likeErr },
        ] = await Promise.all([
          supabase
            .from("profile_views")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profileData.id),
          supabase
            .from("profile_likes")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profileData.id),
        ]);

        if (viewErr) console.error("Error al contar vistas:", viewErr);
        if (likeErr) console.error("Error al contar likes:", likeErr);

        setViews(viewCount || 0);
        setLikes(likeCount || 0);
      }

      /* ---------------- Register view (best-effort) ---------------- */
      try {
        await supabase.from("profile_views").insert({
          user_id: profileData.id,
          // Los siguientes campos son placeholders; agrega lógica real en server
          ip_address: "0.0.0.0",
          user_agent:
            typeof navigator !== "undefined" ? navigator.userAgent : null,
          referrer: typeof document !== "undefined" ? document.referrer : null,
        });
      } catch (vErr) {
        console.warn("No se pudo registrar vista (puede ser RLS):", vErr);
      }
    } catch (err) {
      console.error("Error inesperado al cargar perfil:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [username]);

  /* Load on mount / username change */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* --------------------------------------------------------------
   * Handlers
   * -------------------------------------------------------------- */
  const handleLinkClick = useCallback(
    async (link: LinkWithClicks) => {
      // Registrar clic (best-effort)
      try {
        await supabase.from("link_clicks").insert({
          link_id: link.id,
          user_id: profile?.id ?? null,
          ip_address: "0.0.0.0",
          user_agent:
            typeof navigator !== "undefined" ? navigator.userAgent : null,
          referrer: typeof document !== "undefined" ? document.referrer : null,
        });
      } catch (err) {
        console.warn("No se pudo registrar clic (RLS?):", err);
      }
      // Abrir enlace
      window.open(link.url, "_blank", "noopener,noreferrer");
    },
    [profile?.id]
  );

  const handleLike = useCallback(async () => {
    if (!profile) return;
    try {
      if (isLiked) {
        await supabase
          .from("profile_likes")
          .delete()
          .eq("user_id", profile.id)
          .eq("ip_address", "0.0.0.0");
        setLikes((v) => Math.max(0, v - 1));
        setIsLiked(false);
      } else {
        await supabase.from("profile_likes").insert({
          user_id: profile.id,
          ip_address: "0.0.0.0",
        });
        setLikes((v) => v + 1);
        setIsLiked(true);
      }
    } catch (err) {
      console.warn("No se pudo actualizar like (RLS?):", err);
    }
  }, [isLiked, profile]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${profile?.full_name ?? "Perfil"} - EnlaceHub`,
      text: "Descubre todos mis enlaces en un solo lugar",
      url: typeof window !== "undefined" ? window.location.href : undefined,
    } as ShareData;
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch (err) {
      console.warn("No se pudo compartir:", err);
    }
  }, [profile?.full_name]);

  /* --------------------------------------------------------------
   * Theme helper
   * -------------------------------------------------------------- */
  function getThemeClasses(theme?: string | null) {
    const themes: Record<string, string> = {
      default: "from-slate-50 via-white to-slate-100",
      sunset: "from-orange-50 via-pink-50 to-red-50",
      ocean: "from-blue-50 via-cyan-50 to-teal-50",
      forest: "from-green-50 via-emerald-50 to-teal-50",
      royal: "from-purple-50 via-indigo-50 to-blue-50",
      fire: "from-red-50 via-orange-50 to-yellow-50",
      night: "from-gray-900 via-gray-800 to-gray-900",
      rainbow: "from-pink-50 via-purple-50 to-indigo-50",
    };
    return themes[theme ?? "default"] ?? themes.default;
  }

  /* --------------------------------------------------------------
   * Render states
   * -------------------------------------------------------------- */
  if (!username) {
    return <p>Falta el username en la URL.</p>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold">E</span>
          </div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-gray-500 text-2xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Perfil no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            El usuario @{username} no existe o su perfil no está disponible.
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------
   * Main render
   * -------------------------------------------------------------- */
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getThemeClasses(
        profile.theme
      )} ${profile.dark_mode ? "dark" : ""}`}
    >
      {/* Header con estadísticas */}
      {profile.show_analytics && (
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? "text-red-500 fill-red-500" : ""
                  }`}
                />
                <span>{likes.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Perfil */}
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-xl">
              <AvatarImage
                src={
                  profile.avatar_url || "/placeholder.svg?height=96&width=96"
                }
                alt={profile.full_name || ""}
              />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {profile.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {profile.full_name}
          </h1>
          {profile.bio && <p className="text-gray-600 mb-3">{profile.bio}</p>}

          {profile.location && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.description && (
            <p className="text-gray-700 leading-relaxed mb-6 px-4">
              {profile.description}
            </p>
          )}

          <div className="flex justify-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Disponible
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700"
            >
              Respuesta rápida
            </Badge>
          </div>
        </div>

        {/* Enlaces */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <Card
              key={link.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-md"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
              onClick={() => handleLinkClick(link)}
            >
              <CardContent className="p-0">
                <div
                  className={`bg-gradient-to-r ${
                    link.color ?? "from-slate-200 to-slate-300"
                  } p-[1px] rounded-lg`}
                >
                  <div className="bg-white rounded-lg p-4 group-hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${
                          link.color ?? "from-slate-400 to-slate-600"
                        } text-white shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        {link.icon === "Globe" && <Globe className="w-5 h-5" />}
                        {link.icon === "Instagram" && (
                          <Instagram className="w-5 h-5" />
                        )}
                        {link.icon === "Twitter" && (
                          <Twitter className="w-5 h-5" />
                        )}
                        {link.icon === "Youtube" && (
                          <Youtube className="w-5 h-5" />
                        )}
                        {link.icon === "Mail" && <Mail className="w-5 h-5" />}
                        {link.icon === "ExternalLink" && (
                          <ExternalLink className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h2 className="text-lg font-bold text-gray-900">
                          {link.title}
                        </h2>
                        {link.description && (
                          <p className="text-gray-600 text-sm">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
