"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Palette, BarChart3, Globe, Shield, Smartphone, Star, CheckCircle } from "lucide-react"

export default function LandingPage() {
  const [stats, setStats] = useState({
    users: 12547,
    links: 89234,
    clicks: 2456789,
  })

  useEffect(() => {
    // Simular actualización de estadísticas en tiempo real
    const interval = setInterval(() => {
      setStats((prev) => ({
        users: prev.users + Math.floor(Math.random() * 3),
        links: prev.links + Math.floor(Math.random() * 10),
        clicks: prev.clicks + Math.floor(Math.random() * 50),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Súper Rápido",
      description: "Carga instantánea y navegación fluida para tus visitantes",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Personalización Total",
      description: "Más de 20 temas y opciones ilimitadas de personalización",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Avanzados",
      description: "Estadísticas detalladas y análisis de comportamiento",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Dominio Personalizado",
      description: "Usa tu propio dominio para mayor profesionalismo",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Seguro",
      description: "Protección completa de datos y enlaces seguros",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile First",
      description: "Diseño optimizado para todos los dispositivos",
    },
  ]

  const testimonials = [
    {
      name: "Ana Martínez",
      role: "Influencer",
      content:
        "EnlaceHub transformó completamente mi presencia online. El diseño es increíble y las estadísticas me ayudan mucho.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Carlos Ruiz",
      role: "Emprendedor",
      content: "La mejor alternativa a Linktree. Más funciones, mejor diseño y completamente en español. ¡Perfecto!",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Laura García",
      role: "Artista",
      content: "Amo las opciones de personalización. Mi página refleja perfectamente mi estilo y marca personal.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const plans = [
    {
      name: "Gratuito",
      price: "0",
      description: "Perfecto para empezar",
      features: ["Hasta 5 enlaces", "Temas básicos", "Estadísticas básicas", "Subdominio enlacehub.com"],
      popular: false,
    },
    {
      name: "Pro",
      price: "9",
      description: "Para creadores serios",
      features: [
        "Enlaces ilimitados",
        "Todos los temas premium",
        "Analytics avanzados",
        "Dominio personalizado",
        "Sin marca EnlaceHub",
        "Soporte prioritario",
      ],
      popular: true,
    },
    {
      name: "Business",
      price: "19",
      description: "Para equipos y empresas",
      features: [
        "Todo de Pro",
        "Múltiples usuarios",
        "API personalizada",
        "Integraciones avanzadas",
        "Soporte 24/7",
        "Consultoría personalizada",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EnlaceHub</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Características
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Precios
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
              Testimonios
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
              🚀 La mejor alternativa a Linktree
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Tu página de enlaces
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}
                perfecta
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Crea una página de enlaces hermosa, rápida y completamente personalizable. Conecta con tu audiencia como
              nunca antes con analytics avanzados y diseño profesional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6"
              >
                Crear mi página gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/mariagonzalez">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Ver ejemplo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.users.toLocaleString()}+</div>
              <div className="text-gray-600">Usuarios activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.links.toLocaleString()}+</div>
              <div className="text-gray-600">Enlaces creados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.clicks.toLocaleString()}+</div>
              <div className="text-gray-600">Clics generados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir EnlaceHub?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Más que una simple página de enlaces. Una plataforma completa para potenciar tu presencia digital.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros usuarios</h2>
            <p className="text-xl text-gray-600">Miles de creadores confían en EnlaceHub</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Planes para todos</h2>
            <p className="text-xl text-gray-600">Comienza gratis y escala según tus necesidades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-0 shadow-md ${plan.popular ? "ring-2 ring-purple-500 scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Más Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="text-4xl font-bold text-gray-900 mb-1">€{plan.price}</div>
                    <div className="text-gray-600">{plan.price === "0" ? "Gratis para siempre" : "por mes"}</div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {plan.price === "0" ? "Comenzar Gratis" : "Elegir Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Listo para crear tu página perfecta?</h2>
          <p className="text-xl text-gray-600 mb-8">Únete a miles de creadores que ya están usando EnlaceHub</p>
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6"
            >
              Crear mi página gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold">EnlaceHub</span>
              </div>
              <p className="text-gray-400">La plataforma de enlaces más avanzada y hermosa del mercado.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="hover:text-white transition-colors">
                    Plantillas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white transition-colors">
                    Estado del Servicio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EnlaceHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
