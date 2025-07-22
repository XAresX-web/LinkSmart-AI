"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { generateQRCode, downloadQRCode, type QRStyle } from "@/lib/qr-generator"
import { Download, Palette, Settings, Crown } from "lucide-react"

interface QRCodeGeneratorProps {
  url: string
  linkTitle?: string
  isPro?: boolean
}

export function QRCodeGenerator({ url, linkTitle, isPro = false }: QRCodeGeneratorProps) {
  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [style, setStyle] = useState<QRStyle>({
    size: 256,
    margin: 4,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  })

  useEffect(() => {
    generateQR()
  }, [url, style])

  const generateQR = async () => {
    if (!url) return

    setLoading(true)
    try {
      const qrDataURL = await generateQRCode(url, style)
      setQrCode(qrDataURL)
    } catch (error) {
      console.error("Error generating QR:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (qrCode) {
      downloadQRCode(qrCode, `${linkTitle || "enlace"}-qr.png`)
    }
  }

  const presetColors = [
    { name: "Clásico", dark: "#000000", light: "#ffffff" },
    { name: "Azul", dark: "#1e40af", light: "#dbeafe" },
    { name: "Púrpura", dark: "#7c3aed", light: "#ede9fe" },
    { name: "Verde", dark: "#059669", light: "#d1fae5" },
    { name: "Rojo", dark: "#dc2626", light: "#fee2e2" },
    { name: "Naranja", dark: "#ea580c", light: "#fed7aa" },
  ]

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Generador de Código QR
          {!isPro && <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Pro</Badge>}
        </CardTitle>
        <CardDescription>Crea códigos QR personalizados para tus enlaces</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vista previa del QR */}
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
            {loading ? (
              <div className="w-64 h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-gray-500">Generando...</span>
              </div>
            ) : qrCode ? (
              <img src={qrCode || "/placeholder.svg"} alt="Código QR" className="w-64 h-64" />
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Vista previa del QR</span>
              </div>
            )}
          </div>
        </div>

        {isPro ? (
          <div className="space-y-6">
            {/* Tamaño */}
            <div className="space-y-2">
              <Label>Tamaño: {style.size}px</Label>
              <Slider
                value={[style.size]}
                onValueChange={([value]) => setStyle((prev) => ({ ...prev, size: value }))}
                min={128}
                max={512}
                step={32}
                className="w-full"
              />
            </div>

            {/* Margen */}
            <div className="space-y-2">
              <Label>Margen: {style.margin}</Label>
              <Slider
                value={[style.margin]}
                onValueChange={([value]) => setStyle((prev) => ({ ...prev, margin: value }))}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Nivel de corrección de errores */}
            <div className="space-y-2">
              <Label>Corrección de Errores</Label>
              <Select
                value={style.errorCorrectionLevel}
                onValueChange={(value: "L" | "M" | "Q" | "H") =>
                  setStyle((prev) => ({ ...prev, errorCorrectionLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Bajo (~7%)</SelectItem>
                  <SelectItem value="M">Medio (~15%)</SelectItem>
                  <SelectItem value="Q">Alto (~25%)</SelectItem>
                  <SelectItem value="H">Muy Alto (~30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Colores predefinidos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Colores Predefinidos
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {presetColors.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    className="h-12 flex flex-col gap-1 bg-transparent"
                    onClick={() =>
                      setStyle((prev) => ({
                        ...prev,
                        color: { dark: preset.dark, light: preset.light },
                      }))
                    }
                  >
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.dark }} />
                      <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: preset.light }} />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Colores personalizados */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dark-color">Color Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="dark-color"
                    type="color"
                    value={style.color.dark}
                    onChange={(e) =>
                      setStyle((prev) => ({
                        ...prev,
                        color: { ...prev.color, dark: e.target.value },
                      }))
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={style.color.dark}
                    onChange={(e) =>
                      setStyle((prev) => ({
                        ...prev,
                        color: { ...prev.color, dark: e.target.value },
                      }))
                    }
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="light-color">Color de Fondo</Label>
                <div className="flex gap-2">
                  <Input
                    id="light-color"
                    type="color"
                    value={style.color.light}
                    onChange={(e) =>
                      setStyle((prev) => ({
                        ...prev,
                        color: { ...prev.color, light: e.target.value },
                      }))
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={style.color.light}
                    onChange={(e) =>
                      setStyle((prev) => ({
                        ...prev,
                        color: { ...prev.color, light: e.target.value },
                      }))
                    }
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Personalización Avanzada</h3>
            <p className="text-gray-600 mb-4">Desbloquea opciones de personalización avanzadas con el plan Pro</p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Actualizar a Pro
            </Button>
          </div>
        )}

        {/* Botón de descarga */}
        <Button onClick={handleDownload} disabled={!qrCode || loading} className="w-full gap-2">
          <Download className="w-4 h-4" />
          Descargar Código QR
        </Button>
      </CardContent>
    </Card>
  )
}
