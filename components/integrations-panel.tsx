"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnalyticsIntegrations } from "@/lib/analytics-integrations"
import { BarChart3, Mail, Share2, Webhook, Settings, CheckCircle, Crown, Zap, Facebook } from "lucide-react"

interface Integration {
  id: string
  service: string
  config: any
  is_active: boolean
  created_at: string
}

const availableIntegrations = [
  {
    id: "google_analytics",
    name: "Google Analytics",
    description: "Seguimiento avanzado de visitantes y comportamiento",
    icon: <BarChart3 className="w-6 h-6" />,
    category: "Analytics",
    isPremium: false,
    fields: [
      { key: "tracking_id", label: "ID de Seguimiento", type: "text", placeholder: "GA-XXXXXXXXX" },
      { key: "enhanced_ecommerce", label: "E-commerce Mejorado", type: "boolean" },
    ],
  },
  {
    id: "facebook_pixel",
    name: "Facebook Pixel",
    description: "Seguimiento de conversiones para Facebook Ads",
    icon: <Facebook className="w-6 h-6" />,
    category: "Advertising",
    isPremium: false,
    fields: [
      { key: "pixel_id", label: "ID del Pixel", type: "text", placeholder: "1234567890123456" },
      {
        key: "events",
        label: "Eventos a Rastrear",
        type: "multiselect",
        options: ["PageView", "ViewContent", "Lead", "Purchase"],
      },
    ],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sincroniza contactos y automatiza email marketing",
    icon: <Mail className="w-6 h-6" />,
    category: "Email Marketing",
    isPremium: true,
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "Tu API Key de Mailchimp" },
      { key: "list_id", label: "ID de Lista", type: "text", placeholder: "ID de tu lista" },
      { key: "tags", label: "Tags", type: "text", placeholder: "tag1,tag2,tag3" },
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecta con más de 5000 aplicaciones",
    icon: <Zap className="w-6 h-6" />,
    category: "Automation",
    isPremium: true,
    fields: [
      { key: "webhook_url", label: "Webhook URL", type: "url", placeholder: "https://hooks.zapier.com/..." },
      { key: "events", label: "Eventos", type: "multiselect", options: ["link_click", "profile_view", "new_follower"] },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Recibe notificaciones en tiempo real",
    icon: <Share2 className="w-6 h-6" />,
    category: "Communication",
    isPremium: true,
    fields: [
      { key: "webhook_url", label: "Webhook URL", type: "url", placeholder: "https://hooks.slack.com/..." },
      { key: "channel", label: "Canal", type: "text", placeholder: "#general" },
    ],
  },
  {
    id: "custom_webhook",
    name: "Webhook Personalizado",
    description: "Integra con tu propia aplicación",
    icon: <Webhook className="w-6 h-6" />,
    category: "Developer",
    isPremium: true,
    fields: [
      { key: "url", label: "URL del Webhook", type: "url", placeholder: "https://tu-app.com/webhook" },
      { key: "secret", label: "Secreto", type: "password", placeholder: "Secreto para verificar firma" },
      {
        key: "events",
        label: "Eventos",
        type: "multiselect",
        options: ["link_click", "profile_view", "new_follower", "subscription_change"],
      },
    ],
  },
]

export function IntegrationsPanel({ userId, isPro = false }: { userId: string; isPro?: boolean }) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    loadIntegrations()
  }, [userId])

  const loadIntegrations = async () => {
    try {
      const data = await AnalyticsIntegrations.getIntegrations(userId)
      setIntegrations(data || [])
    } catch (error) {
      console.error("Error loading integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveIntegration = async (service: string) => {
    try {
      await AnalyticsIntegrations.saveIntegration(userId, service, formData)
      await loadIntegrations()
      setEditingIntegration(null)
      setFormData({})
    } catch (error) {
      console.error("Error saving integration:", error)
    }
  }

  const toggleIntegration = async (service: string, isActive: boolean) => {
    try {
      await AnalyticsIntegrations.toggleIntegration(userId, service, isActive)
      await loadIntegrations()
    } catch (error) {
      console.error("Error toggling integration:", error)
    }
  }

  const getIntegrationStatus = (service: string) => {
    const integration = integrations.find((i) => i.service === service)
    return integration?.is_active || false
  }

  const getIntegrationConfig = (service: string) => {
    const integration = integrations.find((i) => i.service === service)
    return integration?.config || {}
  }

  const categories = ["all", "Analytics", "Advertising", "Email Marketing", "Automation", "Communication", "Developer"]

  const filteredIntegrations = availableIntegrations.filter((integration) => {
    if (activeTab === "all") return true
    return integration.category === activeTab
  })

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Integraciones
          </CardTitle>
          <CardDescription>Conecta EnlaceHub con tus herramientas favoritas</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category === "all" ? "Todas" : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredIntegrations.map((integration) => {
              const isActive = getIntegrationStatus(integration.id)
              const config = getIntegrationConfig(integration.id)
              const isEditing = editingIntegration === integration.id

              return (
                <Card key={integration.id} className="border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {integration.name}
                            {integration.isPremium && !isPro && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Pro</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && <CheckCircle className="w-5 h-5 text-green-500" />}
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                          disabled={integration.isPremium && !isPro}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  {integration.isPremium && !isPro ? (
                    <CardContent>
                      <Alert>
                        <Crown className="h-4 w-4" />
                        <AlertDescription>
                          Esta integración está disponible en el plan Pro.
                          <Button variant="link" className="p-0 h-auto font-semibold text-purple-600">
                            Actualizar ahora
                          </Button>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  ) : (
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4">
                          {integration.fields.map((field) => (
                            <div key={field.key}>
                              <Label htmlFor={field.key}>{field.label}</Label>
                              {field.type === "boolean" ? (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Switch
                                    checked={formData[field.key] || false}
                                    onCheckedChange={(checked) =>
                                      setFormData((prev) => ({ ...prev, [field.key]: checked }))
                                    }
                                  />
                                  <Label>{field.label}</Label>
                                </div>
                              ) : field.type === "multiselect" ? (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-2">
                                    {field.options?.map((option: string) => (
                                      <Badge
                                        key={option}
                                        variant={(formData[field.key] || []).includes(option) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                          const current = formData[field.key] || []
                                          const updated = current.includes(option)
                                            ? current.filter((item: string) => item !== option)
                                            : [...current, option]
                                          setFormData((prev) => ({ ...prev, [field.key]: updated }))
                                        }}
                                      >
                                        {option}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <Input
                                  id={field.key}
                                  type={field.type}
                                  value={formData[field.key] || ""}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  className="mt-2"
                                />
                              )}
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button onClick={() => saveIntegration(integration.id)} className="flex-1">
                              Guardar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingIntegration(null)
                                setFormData({})
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.keys(config).length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Configuración actual:</p>
                              {Object.entries(config).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="capitalize">{key.replace("_", " ")}:</span>
                                  <span className="font-mono text-xs">
                                    {typeof value === "boolean"
                                      ? value
                                        ? "Activado"
                                        : "Desactivado"
                                      : Array.isArray(value)
                                        ? value.join(", ")
                                        : String(value).substring(0, 20) + (String(value).length > 20 ? "..." : "")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No configurado</p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingIntegration(integration.id)
                              setFormData(config)
                            }}
                            className="w-full"
                          >
                            {Object.keys(config).length > 0 ? "Editar" : "Configurar"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
