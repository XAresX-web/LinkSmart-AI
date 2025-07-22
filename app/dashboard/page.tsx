"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  BarChart3,
  Settings,
  Palette,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  ExternalLink,
  GripVertical,
  Camera,
  Save,
  TrendingUp,
  Users,
  MousePointer,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  CheckCircle,
  AlertCircle,
  Crown,
  Zap,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  description?: string;
  location?: string;
  custom_domain?: string;
  theme: string;
  dark_mode: boolean;
  show_analytics: boolean;
  show_branding: boolean;
}

interface Link {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  position: number;
  active: boolean;
  clicks?: number;
}

interface Analytics {
  totalClicks: number;
  totalViews: number;
  totalLikes: number;
  clicksToday: number;
  viewsToday: number;
  topLinks: Array<{ title: string; clicks: number }>;
  deviceStats: { desktop: number; mobile: number; tablet: number };
  countryStats: Array<{ country: string; views: number }>;
  dailyStats: Array<{ date: string; views: number; clicks: number }>;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    description: "",
    url: "",
    icon: "Globe",
    color: "from-blue-500 to-purple-600",
  });
  const [showAddLink, setShowAddLink] = useState(false);
  const [copied, setCopied] = useState(false);

  console.log("Dashboard render: user =", user, "loading =", loading);

  const iconOptions = [
    { name: "Globe", icon: <Globe className="w-4 h-4" /> },
    { name: "Instagram", icon: <Instagram className="w-4 h-4" /> },
    { name: "Twitter", icon: <Twitter className="w-4 h-4" /> },
    { name: "Youtube", icon: <Youtube className="w-4 h-4" /> },
    { name: "Mail", icon: <Mail className="w-4 h-4" /> },
    { name: "ExternalLink", icon: <ExternalLink className="w-4 h-4" /> },
  ];

  const colorOptions = [
    "from-blue-500 to-purple-600",
    "from-red-500 to-pink-500",
    "from-pink-500 to-orange-500",
    "from-green-500 to-teal-500",
    "from-purple-500 to-indigo-600",
    "from-yellow-500 to-orange-500",
    "from-gray-500 to-gray-700",
    "from-emerald-500 to-cyan-500",
  ];

  const themes = [
    {
      name: "default",
      label: "Clásico",
      gradient: "from-blue-500 to-purple-600",
    },
    {
      name: "sunset",
      label: "Atardecer",
      gradient: "from-orange-500 to-pink-500",
    },
    { name: "ocean", label: "Océano", gradient: "from-blue-500 to-teal-500" },
    {
      name: "forest",
      label: "Bosque",
      gradient: "from-green-500 to-emerald-600",
    },
    { name: "royal", label: "Real", gradient: "from-purple-600 to-indigo-700" },
    { name: "fire", label: "Fuego", gradient: "from-red-500 to-orange-600" },
    { name: "night", label: "Noche", gradient: "from-gray-700 to-gray-900" },
    {
      name: "rainbow",
      label: "Arcoíris",
      gradient: "from-pink-500 via-purple-500 to-indigo-500",
    },
  ];

  useEffect(() => {
    // 1) Aún no sabemos si hay usuario (hook todavía resolviendo: user === undefined)
    if (user === undefined) {
      // no hagas nada todavía; manten loading = true
      return;
    }

    // 2) No hay sesión (user === null)
    if (user === null) {
      setLoading(false); // deja de mostrar pantalla de carga
      return;
    }

    // 3) Hay usuario -> carga datos
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadUserData(), loadAnalytics()]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    console.log("Loading profile...");
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) console.error("Profile error:", profileError);
    if (profileData) setProfile(profileData);

    console.log("Loading links...");
    const { data: linksData, error: linksError } = await supabase
      .from("links")
      .select("*") // deja simple hasta que confirmemos que funciona
      .eq("user_id", user.id)
      .order("position");

    if (linksError) console.error("Links error:", linksError);
    if (linksData) setLinks(linksData);
  };

  const loadAnalytics = async () => {
    try {
      // Obtener estadísticas de vistas
      const { data: viewsData } = await supabase
        .from("profile_views")
        .select("*")
        .eq("user_id", user?.id);

      // Obtener estadísticas de clics
      const { data: clicksData } = await supabase
        .from("link_clicks")
        .select("*, links(title)")
        .eq("user_id", user?.id);

      // Obtener likes
      const { data: likesData } = await supabase
        .from("profile_likes")
        .select("*")
        .eq("user_id", user?.id);

      if (viewsData && clicksData && likesData) {
        const today = new Date().toISOString().split("T")[0];

        // Calcular estadísticas
        const totalViews = viewsData.length;
        const totalClicks = clicksData.length;
        const totalLikes = likesData.length;

        const viewsToday = viewsData.filter((v) =>
          v.viewed_at.startsWith(today)
        ).length;

        const clicksToday = clicksData.filter((c) =>
          c.clicked_at.startsWith(today)
        ).length;

        // Top enlaces
        const linkClickCounts = clicksData.reduce((acc: any, click: any) => {
          const title = click.links?.title || "Enlace eliminado";
          acc[title] = (acc[title] || 0) + 1;
          return acc;
        }, {});

        const topLinks = Object.entries(linkClickCounts)
          .map(([title, clicks]) => ({ title, clicks: clicks as number }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 5);

        // Estadísticas por dispositivo (simulado)
        const deviceStats = {
          desktop: Math.floor(totalViews * 0.4),
          mobile: Math.floor(totalViews * 0.5),
          tablet: Math.floor(totalViews * 0.1),
        };

        // Estadísticas por país
        const countryCounts = viewsData.reduce((acc: any, view: any) => {
          const country = view.country || "Unknown";
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {});

        const countryStats = Object.entries(countryCounts)
          .map(([country, views]) => ({ country, views: views as number }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        // Estadísticas diarias (últimos 7 días)
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          const dayViews = viewsData.filter((v) =>
            v.viewed_at.startsWith(dateStr)
          ).length;
          const dayClicks = clicksData.filter((c) =>
            c.clicked_at.startsWith(dateStr)
          ).length;

          dailyStats.push({
            date: dateStr,
            views: dayViews,
            clicks: dayClicks,
          });
        }

        setAnalytics({
          totalClicks,
          totalViews,
          totalLikes,
          clicksToday,
          viewsToday,
          topLinks,
          deviceStats,
          countryStats,
          dailyStats,
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      console.log("loadAnalytics end");
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          description: profile.description,
          location: profile.location,
          theme: profile.theme,
          dark_mode: profile.dark_mode,
          show_analytics: profile.show_analytics,
          show_branding: profile.show_branding,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (!error) {
        // Mostrar mensaje de éxito
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const addLink = async () => {
    if (!user) return;
    if (!newLink.title || !newLink.url) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("links")
        .insert({
          user_id: user?.id,
          title: newLink.title,
          description: newLink.description,
          url: newLink.url,
          icon: newLink.icon,
          color: newLink.color,
          position: links.length + 1,
          active: true,
        })
        .select()
        .single();

      if (data && !error) {
        setLinks([...links, { ...data, clicks: 0 }]);
        setNewLink({
          title: "",
          description: "",
          url: "",
          icon: "Globe",
          color: "from-blue-500 to-purple-600",
        });
        setShowAddLink(false);
      }
    } catch (error) {
      console.error("Error adding link:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase.from("links").delete().eq("id", id);

      if (!error) {
        setLinks(links.filter((link) => link.id !== id));
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const toggleLink = async (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;

    try {
      const { error } = await supabase
        .from("links")
        .update({ active: !link.active })
        .eq("id", id);

      if (!error) {
        setLinks(
          links.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
        );
      }
    } catch (error) {
      console.error("Error toggling link:", error);
    }
  };

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/${profile?.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!loading && user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <p className="mb-4">No has iniciado sesión.</p>
          <Button onClick={() => (window.location.href = "/auth/login")}>
            Ir a iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">E</span>
          </div>
          <p className="text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EnlaceHub</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700"
            >
              <Crown className="w-3 h-3 mr-1" />
              Plan Gratuito
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={copyProfileUrl}
              className="gap-2 bg-transparent"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "¡Copiado!" : "Copiar URL"}
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Eye className="w-4 h-4" />
              Vista Previa
            </Button>
            <Button onClick={signOut} variant="ghost">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {profile?.full_name || "Usuario"}! 👋
          </h1>
          <p className="text-gray-600">
            Gestiona tu página de enlaces y analiza tu rendimiento
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Enlaces
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Settings className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview" className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Vistas Totales
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.totalViews
                          ? analytics.totalViews.toLocaleString()
                          : "0"}
                      </p>
                      <p className="text-xs text-green-600">
                        +{analytics?.viewsToday ?? 0} hoy
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Clics Totales
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.totalClicks
                          ? analytics.totalClicks.toLocaleString()
                          : "0"}
                      </p>
                      <p className="text-xs text-green-600">
                        +{analytics?.clicksToday ?? 0} hoy
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MousePointer className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Enlaces Activos
                      </p>
                      <p className="text-2xl font-bold">
                        {links.filter((l) => l.active).length}
                      </p>
                      <p className="text-xs text-gray-600">
                        de {links.length} totales
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Me Gusta
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.totalLikes.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-600">total recibidos</p>
                    </div>
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos y estadísticas */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Enlaces más populares */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Enlaces Más Populares
                  </CardTitle>
                  <CardDescription>Tus enlaces con más clics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium truncate">
                            {link.title}
                          </span>
                        </div>
                        <Badge variant="secondary">{link.clicks} clics</Badge>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">
                        No hay datos suficientes
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dispositivos */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Dispositivos
                  </CardTitle>
                  <CardDescription>Cómo acceden tus visitantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <span>Móvil</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${
                                ((analytics?.deviceStats.mobile || 0) /
                                  (analytics?.totalViews || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {analytics?.deviceStats.mobile || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-purple-600" />
                        <span>Escritorio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{
                              width: `${
                                ((analytics?.deviceStats.desktop || 0) /
                                  (analytics?.totalViews || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {analytics?.deviceStats.desktop || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Tablet className="w-5 h-5 text-green-600" />
                        <span>Tablet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${
                                ((analytics?.deviceStats.tablet || 0) /
                                  (analytics?.totalViews || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {analytics?.deviceStats.tablet || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actividad reciente */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Actividad de los Últimos 7 Días
                </CardTitle>
                <CardDescription>Vistas y clics diarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.dailyStats.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{day.views}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">{day.clicks}</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No hay datos suficientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enlaces */}
          <TabsContent value="links" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Lista de enlaces */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Mis Enlaces</h2>
                  <Button
                    onClick={() => setShowAddLink(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Enlace
                  </Button>
                </div>

                {links.length >= 5 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Has alcanzado el límite de 5 enlaces del plan gratuito.
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold text-purple-600"
                      >
                        Actualiza a Pro
                      </Button>{" "}
                      para enlaces ilimitados.
                    </AlertDescription>
                  </Alert>
                )}

                {showAddLink && (
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle>Nuevo Enlace</CardTitle>
                      <CardDescription>
                        Agrega un nuevo enlace a tu página
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          value={newLink.title}
                          onChange={(e) =>
                            setNewLink({ ...newLink, title: e.target.value })
                          }
                          placeholder="Ej: Mi Portafolio"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                          id="description"
                          value={newLink.description}
                          onChange={(e) =>
                            setNewLink({
                              ...newLink,
                              description: e.target.value,
                            })
                          }
                          placeholder="Breve descripción del enlace"
                        />
                      </div>
                      <div>
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          value={newLink.url}
                          onChange={(e) =>
                            setNewLink({ ...newLink, url: e.target.value })
                          }
                          placeholder="https://ejemplo.com"
                        />
                      </div>
                      <div>
                        <Label>Icono</Label>
                        <div className="flex gap-2 mt-2">
                          {iconOptions.map((option) => (
                            <Button
                              key={option.name}
                              variant={
                                newLink.icon === option.name
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                setNewLink({ ...newLink, icon: option.name })
                              }
                            >
                              {option.icon}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Color</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {colorOptions.map((color) => (
                            <div
                              key={color}
                              className={`h-8 rounded-lg bg-gradient-to-r ${color} cursor-pointer border-2 ${
                                newLink.color === color
                                  ? "border-gray-900"
                                  : "border-transparent"
                              }`}
                              onClick={() => setNewLink({ ...newLink, color })}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={addLink}
                          className="flex-1"
                          disabled={links.length >= 5}
                        >
                          Agregar Enlace
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddLink(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {links.map((link) => (
                    <Card key={link.id} className="group border-0 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${link.color} text-white`}
                          >
                            {link.icon === "Globe" && (
                              <Globe className="w-4 h-4" />
                            )}
                            {link.icon === "Instagram" && (
                              <Instagram className="w-4 h-4" />
                            )}
                            {link.icon === "Twitter" && (
                              <Twitter className="w-4 h-4" />
                            )}
                            {link.icon === "Youtube" && (
                              <Youtube className="w-4 h-4" />
                            )}
                            {link.icon === "Mail" && (
                              <Mail className="w-4 h-4" />
                            )}
                            {link.icon === "ExternalLink" && (
                              <ExternalLink className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {link.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {link.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {link.clicks || 0} clics
                              </Badge>
                              <Switch
                                checked={link.active}
                                onCheckedChange={() => toggleLink(link.id)}
                                className="scale-75"
                              />
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLink(link.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {links.length === 0 && (
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-8 text-center">
                        <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No tienes enlaces aún
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Comienza agregando tu primer enlace para compartir con
                          tu audiencia
                        </p>
                        <Button
                          onClick={() => setShowAddLink(true)}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar mi primer enlace
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Vista previa */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Vista Previa</h2>
                <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-white shadow-lg">
                        <AvatarImage
                          src={profile?.avatar_url || "/placeholder.svg"}
                          alt={profile?.full_name || ""}
                        />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg">
                        {profile?.full_name || "Tu Nombre"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.bio || "Tu profesión"}
                      </p>
                      {profile?.location && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {links
                        .filter((link) => link.active)
                        .slice(0, 4)
                        .map((link) => (
                          <div
                            key={link.id}
                            className="p-3 bg-white rounded-lg shadow-sm border"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg bg-gradient-to-r ${link.color} text-white`}
                              >
                                {link.icon === "Globe" && (
                                  <Globe className="w-3 h-3" />
                                )}
                                {link.icon === "Instagram" && (
                                  <Instagram className="w-3 h-3" />
                                )}
                                {link.icon === "Twitter" && (
                                  <Twitter className="w-3 h-3" />
                                )}
                                {link.icon === "Youtube" && (
                                  <Youtube className="w-3 h-3" />
                                )}
                                {link.icon === "Mail" && (
                                  <Mail className="w-3 h-3" />
                                )}
                                {link.icon === "ExternalLink" && (
                                  <ExternalLink className="w-3 h-3" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {link.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {link.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {links.filter((l) => l.active).length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          Agrega enlaces para ver la vista previa
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>
                  Personaliza la información que aparece en tu página
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-gray-200">
                      <AvatarImage
                        src={profile?.avatar_url || "/placeholder.svg"}
                        alt={profile?.full_name || ""}
                      />
                      <AvatarFallback className="text-2xl">
                        {profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={profile?.full_name || ""}
                      onChange={(e) =>
                        setProfile((prev) =>
                          prev ? { ...prev, full_name: e.target.value } : null
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={profile?.username || ""}
                      disabled
                      className="pr-32"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                      .enlacehub.com
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El nombre de usuario no se puede cambiar
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Título/Profesión</Label>
                  <Input
                    id="bio"
                    value={profile?.bio || ""}
                    onChange={(e) =>
                      setProfile((prev) =>
                        prev ? { ...prev, bio: e.target.value } : null
                      )
                    }
                    placeholder="Ej: Diseñador UX/UI"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={profile?.description || ""}
                    onChange={(e) =>
                      setProfile((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                    placeholder="Cuéntanos sobre ti..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={profile?.location || ""}
                    onChange={(e) =>
                      setProfile((prev) =>
                        prev ? { ...prev, location: e.target.value } : null
                      )
                    }
                    placeholder="Ej: Madrid, España"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Configuración de Privacidad
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mostrar Estadísticas Públicas</Label>
                        <p className="text-sm text-muted-foreground">
                          Permite que los visitantes vean vistas y likes
                        </p>
                      </div>
                      <Switch
                        checked={profile?.show_analytics || false}
                        onCheckedChange={(checked) =>
                          setProfile((prev) =>
                            prev ? { ...prev, show_analytics: checked } : null
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mostrar Marca EnlaceHub</Label>
                        <p className="text-sm text-muted-foreground">
                          Muestra "Creado con EnlaceHub" en tu página
                        </p>
                      </div>
                      <Switch
                        checked={profile?.show_branding || false}
                        onCheckedChange={(checked) =>
                          setProfile((prev) =>
                            prev ? { ...prev, show_branding: checked } : null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardContent>
            </Card>

            {/* Dominio personalizado */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Dominio Personalizado
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Pro
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Usa tu propio dominio en lugar de enlacehub.com/usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-domain">Tu Dominio</Label>
                    <Input
                      id="custom-domain"
                      placeholder="tudominio.com"
                      disabled
                      className="opacity-50"
                    />
                  </div>
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Los dominios personalizados están disponibles en el plan
                      Pro.
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold text-purple-600"
                      >
                        Actualizar ahora
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apariencia */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Personalización Visual</CardTitle>
                <CardDescription>
                  Personaliza el aspecto de tu página
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Tema de Color</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Elige el tema que mejor represente tu estilo
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {themes.map((theme) => (
                      <div
                        key={theme.name}
                        className={`relative p-4 rounded-lg bg-gradient-to-r ${
                          theme.gradient
                        } cursor-pointer border-2 transition-all ${
                          profile?.theme === theme.name
                            ? "border-white shadow-lg scale-105"
                            : "border-transparent hover:scale-102"
                        }`}
                        onClick={() =>
                          setProfile((prev) =>
                            prev ? { ...prev, theme: theme.name } : null
                          )
                        }
                      >
                        <div className="text-white text-center">
                          <div className="font-medium">{theme.label}</div>
                        </div>
                        {profile?.theme === theme.name && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Modo Oscuro
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Activa el tema oscuro para tu página
                      </p>
                    </div>
                    <Switch
                      checked={profile?.dark_mode || false}
                      onCheckedChange={(checked) =>
                        setProfile((prev) =>
                          prev ? { ...prev, dark_mode: checked } : null
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Animaciones
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Habilita animaciones suaves en tu página
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Aplicando..." : "Aplicar Cambios"}
                </Button>
              </CardContent>
            </Card>

            {/* Temas premium */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Temas Premium
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Pro
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Accede a temas exclusivos y opciones avanzadas de
                  personalización
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 opacity-50">
                  {[
                    {
                      name: "Neon",
                      gradient: "from-cyan-400 via-purple-500 to-pink-500",
                    },
                    {
                      name: "Galaxy",
                      gradient: "from-purple-900 via-blue-900 to-indigo-900",
                    },
                    {
                      name: "Sunset Pro",
                      gradient: "from-yellow-400 via-red-500 to-pink-500",
                    },
                    {
                      name: "Ocean Deep",
                      gradient: "from-blue-800 via-teal-600 to-cyan-400",
                    },
                    {
                      name: "Forest Pro",
                      gradient: "from-green-800 via-emerald-600 to-teal-400",
                    },
                    {
                      name: "Royal Gold",
                      gradient: "from-yellow-600 via-orange-600 to-red-600",
                    },
                  ].map((theme) => (
                    <div
                      key={theme.name}
                      className={`p-4 rounded-lg bg-gradient-to-r ${theme.gradient} cursor-not-allowed`}
                    >
                      <div className="text-white text-center">
                        <div className="font-medium">{theme.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Desbloquear Temas Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Avanzados */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        CTR Promedio
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.totalViews
                          ? (
                              (analytics.totalClicks / analytics.totalViews) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-gray-600">
                        Click-through rate
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Engagement
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.totalViews
                          ? (
                              (analytics.totalLikes / analytics.totalViews) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-gray-600">Likes por vista</p>
                    </div>
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Mejor Día
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.dailyStats.reduce(
                          (max, day) => (day.views > max.views ? day : max),
                          {
                            views: 0,
                            date: "",
                          }
                        ).views || 0}
                      </p>
                      <p className="text-xs text-gray-600">vistas en un día</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Países
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.countryStats.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">países diferentes</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos detallados */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top países */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Top Países
                  </CardTitle>
                  <CardDescription>
                    De dónde vienen tus visitantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.countryStats.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">
                            {country.country === "ES"
                              ? "🇪🇸 España"
                              : country.country === "US"
                              ? "🇺🇸 Estados Unidos"
                              : country.country === "MX"
                              ? "🇲🇽 México"
                              : country.country === "AR"
                              ? "🇦🇷 Argentina"
                              : country.country === "CO"
                              ? "🇨🇴 Colombia"
                              : `🌍 ${country.country}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                              style={{
                                width: `${
                                  (country.views /
                                    (analytics?.totalViews || 1)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {country.views}
                          </span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">
                        No hay datos suficientes
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rendimiento por enlace detallado */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Rendimiento Detallado
                  </CardTitle>
                  <CardDescription>
                    Análisis completo de cada enlace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {links.map((link) => (
                      <div key={link.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg bg-gradient-to-r ${link.color} text-white`}
                            >
                              {link.icon === "Globe" && (
                                <Globe className="w-4 h-4" />
                              )}
                              {link.icon === "Instagram" && (
                                <Instagram className="w-4 h-4" />
                              )}
                              {link.icon === "Twitter" && (
                                <Twitter className="w-4 h-4" />
                              )}
                              {link.icon === "Youtube" && (
                                <Youtube className="w-4 h-4" />
                              )}
                              {link.icon === "Mail" && (
                                <Mail className="w-4 h-4" />
                              )}
                              {link.icon === "ExternalLink" && (
                                <ExternalLink className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{link.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {link.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {link.clicks || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              clics
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>CTR:</span>
                            <span className="font-medium">
                              {analytics?.totalViews
                                ? (
                                    ((link.clicks || 0) /
                                      analytics.totalViews) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${link.color} rounded-full`}
                              style={{
                                width: `${
                                  analytics?.totalClicks
                                    ? ((link.clicks || 0) /
                                        analytics.totalClicks) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {links.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Agrega enlaces para ver estadísticas detalladas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Premium */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Analytics Premium
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Pro
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Obtén insights más profundos sobre tu audiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 opacity-50">
                  <div className="space-y-4">
                    <h4 className="font-medium">Funciones Premium:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Exportar datos a CSV/PDF
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Análisis de horarios pico
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Seguimiento de conversiones
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Comparativas mensuales
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Integración con Google Analytics
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <h5 className="font-medium mb-2">
                        Gráfico de Conversiones
                      </h5>
                      <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500">
                          Vista previa no disponible
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Desbloquear Analytics Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
