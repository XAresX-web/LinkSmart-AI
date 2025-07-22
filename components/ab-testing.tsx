"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Play, Pause, BarChart3, Crown, CheckCircle, AlertCircle } from "lucide-react"

interface ABTest {
  id: string
  name: string
  description: string
  variant_a: any
  variant_b: any
  traffic_split: number
  status: "draft" | "running" | "completed" | "paused"
  start_date: string
  end_date: string
  created_at: string
}

interface ABTestResult {
  variant: "a" | "b"
  views: number
  clicks: number
  conversions: number
  ctr: number
  conversionRate: number
}

export function ABTesting({ userId, isPro = false }: { userId: string; isPro?: boolean }) {
  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    variant_a: { title: "", description: "", color: "from-blue-500 to-purple-600" },
    variant_b: { title: "", description: "", color: "from-red-500 to-pink-500" },
    traffic_split: 50,
    duration_days: 7,
  })

  useEffect(() => {
    if (isPro) {
      loadTests()
    }
  }, [userId, isPro])

  const loadTests = async () => {
    try {
      const { data, error } = await supabase
        .from("ab_tests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTests(data || [])
    } catch (error) {
      console.error("Error loading A/B tests:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTest = async () => {
    if (!newTest.name || !newTest.variant_a.title || !newTest.variant_b.title) return

    try {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + newTest.duration_days)

      const { data, error } = await supabase
        .from("ab_tests")
        .insert({
          user_id: userId,
          name: newTest.name,
          description: newTest.description,
          variant_a: newTest.variant_a,
          variant_b: newTest.variant_b,
          traffic_split: newTest.traffic_split,
          status: "draft",
          end_date: endDate.toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setTests([data, ...tests])
      setNewTest({
        name: "",
        description: "",
        variant_a: { title: "", description: "", color: "from-blue-500 to-purple-600" },
        variant_b: { title: "", description: "", color: "from-red-500 to-pink-500" },
        traffic_split: 50,
        duration_days: 7,
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error("Error creating A/B test:", error)
    }
  }

  const startTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from("ab_tests")
        .update({
          status: "running",
          start_date: new Date().toISOString(),
        })
        .eq("id", testId)

      if (error) throw error
      loadTests()
    } catch (error) {
      console.error("Error starting test:", error)
    }
  }

  const pauseTest = async (testId: string) => {
    try {
      const { error } = await supabase.from("ab_tests").update({ status: "paused" }).eq("id", testId)

      if (error) throw error
      loadTests()
    } catch (error) {
      console.error("Error pausing test:", error)
    }
  }

  const getTestResults = async (testId: string): Promise<{ a: ABTestResult; b: ABTestResult }> => {
    // Simular resultados (en producción, calcular desde ab_test_results)
    return {
      a: {
        variant: "a",
        views: Math.floor(Math.random() * 1000) + 500,
        clicks: Math.floor(Math.random() * 100) + 50,
        conversions: Math.floor(Math.random() * 20) + 10,
        ctr: 0,
        conversionRate: 0,
      },
      b: {
        variant: "b",
        views: Math.floor(Math.random() * 1000) + 500,
        clicks: Math.floor(Math.random() * 100) + 50,
        conversions: Math.floor(Math.random() * 20) + 10,
        ctr: 0,
        conversionRate: 0,
      },
    }
  }

  if (!isPro) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            A/B Testing
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Pro</Badge>
          </CardTitle>
          <CardDescription>Optimiza tus enlaces con pruebas A/B avanzadas</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">A/B Testing Avanzado</h3>
          <p className="text-gray-600 mb-6">Prueba diferentes versiones de tus enlaces para maximizar conversiones</p>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Pruebas A/B ilimitadas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Análisis estadístico avanzado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Segmentación de audiencia</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Reportes detallados</span>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Actualizar a Pro
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                A/B Testing
              </CardTitle>
              <CardDescription>Optimiza tus enlaces con pruebas A/B</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Play className="w-4 h-4" />
              Nueva Prueba
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showCreateForm && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Crear Nueva Prueba A/B</CardTitle>
            <CardDescription>Configura una prueba para comparar dos versiones de tu enlace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-name">Nombre de la Prueba</Label>
                <Input
                  id="test-name"
                  value={newTest.name}
                  onChange={(e) => setNewTest((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Prueba de título principal"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duración (días)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newTest.duration_days}
                  onChange={(e) => setNewTest((prev) => ({ ...prev, duration_days: Number.parseInt(e.target.value) }))}
                  min="1"
                  max="30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newTest.description}
                onChange={(e) => setNewTest((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe qué estás probando..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Variante A */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Variante A (Control)</h3>
                <div>
                  <Label>Título</Label>
                  <Input
                    value={newTest.variant_a.title}
                    onChange={(e) =>
                      setNewTest((prev) => ({
                        ...prev,
                        variant_a: { ...prev.variant_a, title: e.target.value },
                      }))
                    }
                    placeholder="Título original"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={newTest.variant_a.description}
                    onChange={(e) =>
                      setNewTest((prev) => ({
                        ...prev,
                        variant_a: { ...prev.variant_a, description: e.target.value },
                      }))
                    }
                    placeholder="Descripción original"
                  />
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <h4 className="font-medium">{newTest.variant_a.title || "Título A"}</h4>
                  <p className="text-sm opacity-90">{newTest.variant_a.description || "Descripción A"}</p>
                </div>
              </div>

              {/* Variante B */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Variante B (Prueba)</h3>
                <div>
                  <Label>Título</Label>
                  <Input
                    value={newTest.variant_b.title}
                    onChange={(e) =>
                      setNewTest((prev) => ({
                        ...prev,
                        variant_b: { ...prev.variant_b, title: e.target.value },
                      }))
                    }
                    placeholder="Título alternativo"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={newTest.variant_b.description}
                    onChange={(e) =>
                      setNewTest((prev) => ({
                        ...prev,
                        variant_b: { ...prev.variant_b, description: e.target.value },
                      }))
                    }
                    placeholder="Descripción alternativa"
                  />
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <h4 className="font-medium">{newTest.variant_b.title || "Título B"}</h4>
                  <p className="text-sm opacity-90">{newTest.variant_b.description || "Descripción B"}</p>
                </div>
              </div>
            </div>

            <div>
              <Label>
                División de Tráfico: {newTest.traffic_split}% A / {100 - newTest.traffic_split}% B
              </Label>
              <input
                type="range"
                min="10"
                max="90"
                value={newTest.traffic_split}
                onChange={(e) => setNewTest((prev) => ({ ...prev, traffic_split: Number.parseInt(e.target.value) }))}
                className="w-full mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createTest} className="flex-1">
                Crear Prueba
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de pruebas */}
      <div className="space-y-4">
        {tests.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            onStart={() => startTest(test.id)}
            onPause={() => pauseTest(test.id)}
            getResults={() => getTestResults(test.id)}
          />
        ))}

        {tests.length === 0 && !loading && (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center p-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pruebas A/B</h3>
              <p className="text-gray-600 mb-4">Crea tu primera prueba A/B para optimizar tus enlaces</p>
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Play className="w-4 h-4" />
                Crear Primera Prueba
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function TestCard({
  test,
  onStart,
  onPause,
  getResults,
}: {
  test: ABTest
  onStart: () => void
  onPause: () => void
  getResults: () => Promise<{ a: ABTestResult; b: ABTestResult }>
}) {
  const [results, setResults] = useState<{ a: ABTestResult; b: ABTestResult } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadResults = async () => {
    if (test.status === "running" || test.status === "completed") {
      setLoading(true)
      try {
        const data = await getResults()
        // Calcular CTR y conversion rate
        data.a.ctr = data.a.views > 0 ? (data.a.clicks / data.a.views) * 100 : 0
        data.a.conversionRate = data.a.clicks > 0 ? (data.a.conversions / data.a.clicks) * 100 : 0
        data.b.ctr = data.b.views > 0 ? (data.b.clicks / data.b.views) * 100 : 0
        data.b.conversionRate = data.b.clicks > 0 ? (data.b.conversions / data.b.clicks) * 100 : 0
        setResults(data)
      } catch (error) {
        console.error("Error loading results:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadResults()
  }, [test.status])

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, text: "Borrador" },
      running: { variant: "default" as const, text: "Ejecutándose" },
      completed: { variant: "outline" as const, text: "Completada" },
      paused: { variant: "destructive" as const, text: "Pausada" },
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  const statusBadge = getStatusBadge(test.status)

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {test.name}
              <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
            </CardTitle>
            <CardDescription>{test.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {test.status === "draft" && (
              <Button onClick={onStart} size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                Iniciar
              </Button>
            )}
            {test.status === "running" && (
              <Button onClick={onPause} size="sm" variant="outline" className="gap-2 bg-transparent">
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {(test.status === "running" || test.status === "completed") && (
        <CardContent>
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando resultados...</p>
                </div>
              ) : results ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Variante A */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Variante A</h3>
                      {results.a.ctr > results.b.ctr && <Badge className="bg-green-100 text-green-700">Ganadora</Badge>}
                    </div>
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <h4 className="font-medium">{test.variant_a.title}</h4>
                      <p className="text-sm opacity-90">{test.variant_a.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vistas</span>
                        <span className="font-medium">{results.a.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clics</span>
                        <span className="font-medium">{results.a.clicks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CTR</span>
                        <span className="font-medium">{results.a.ctr.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversiones</span>
                        <span className="font-medium">{results.a.conversions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variante B */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Variante B</h3>
                      {results.b.ctr > results.a.ctr && <Badge className="bg-green-100 text-green-700">Ganadora</Badge>}
                    </div>
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      <h4 className="font-medium">{test.variant_b.title}</h4>
                      <p className="text-sm opacity-90">{test.variant_b.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vistas</span>
                        <span className="font-medium">{results.b.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clics</span>
                        <span className="font-medium">{results.b.clicks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CTR</span>
                        <span className="font-medium">{results.b.ctr.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversiones</span>
                        <span className="font-medium">{results.b.conversions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay resultados disponibles aún</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">División de Tráfico</Label>
                  <p className="font-medium">
                    {test.traffic_split}% A / {100 - test.traffic_split}% B
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Fecha de Inicio</Label>
                  <p className="font-medium">
                    {test.start_date ? new Date(test.start_date).toLocaleDateString() : "No iniciada"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Fecha de Fin</Label>
                  <p className="font-medium">{new Date(test.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Duración</Label>
                  <p className="font-medium">
                    {Math.ceil(
                      (new Date(test.end_date).getTime() - new Date(test.start_date || test.created_at).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    días
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}
