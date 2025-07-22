"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Download, Upload, Shield, Clock, HardDrive, Crown, CheckCircle, RefreshCw } from "lucide-react"

interface Backup {
  id: string
  backup_data: any
  backup_type: "manual" | "automatic"
  file_size: number
  created_at: string
}

export function BackupManager({ userId, isPro = false }: { userId: string; isPro?: boolean }) {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isPro) {
      loadBackups()
    }
  }, [userId, isPro])

  const loadBackups = async () => {
    try {
      const { data, error } = await supabase
        .from("backups")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setBackups(data || [])
    } catch (error) {
      console.error("Error loading backups:", error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    setCreating(true)
    setProgress(0)

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Obtener todos los datos del usuario
      const [profileData, linksData, analyticsData] = await Promise.all([
        supabase.from("users").select("*").eq("id", userId).single(),
        supabase.from("links").select("*").eq("user_id", userId),
        supabase.from("profile_views").select("*").eq("user_id", userId).limit(1000),
      ])

      const backupData = {
        profile: profileData.data,
        links: linksData.data,
        analytics: analyticsData.data,
        created_at: new Date().toISOString(),
        version: "1.0",
      }

      const backupSize = JSON.stringify(backupData).length

      const { data, error } = await supabase
        .from("backups")
        .insert({
          user_id: userId,
          backup_data: backupData,
          backup_type: "manual",
          file_size: backupSize,
        })
        .select()
        .single()

      clearInterval(progressInterval)
      setProgress(100)

      if (error) throw error

      setBackups([data, ...backups])

      setTimeout(() => {
        setProgress(0)
        setCreating(false)
      }, 1000)
    } catch (error) {
      console.error("Error creating backup:", error)
      setCreating(false)
      setProgress(0)
    }
  }

  const downloadBackup = (backup: Backup) => {
    const dataStr = JSON.stringify(backup.backup_data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `enlacehub-backup-${new Date(backup.created_at).toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const restoreBackup = async (backup: Backup) => {
    if (!confirm("¿Estás seguro de que quieres restaurar este backup? Esto sobrescribirá tus datos actuales.")) {
      return
    }

    setRestoring(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90))
      }, 300)

      const { profile, links } = backup.backup_data

      // Restaurar perfil
      if (profile) {
        await supabase
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
          })
          .eq("id", userId)
      }

      // Restaurar enlaces
      if (links && links.length > 0) {
        // Eliminar enlaces actuales
        await supabase.from("links").delete().eq("user_id", userId)

        // Insertar enlaces del backup
        const linksToInsert = links.map((link: any) => ({
          user_id: userId,
          title: link.title,
          description: link.description,
          url: link.url,
          icon: link.icon,
          color: link.color,
          position: link.position,
          active: link.active,
        }))

        await supabase.from("links").insert(linksToInsert)
      }

      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        setProgress(0)
        setRestoring(false)
        window.location.reload() // Recargar para mostrar los datos restaurados
      }, 1000)
    } catch (error) {
      console.error("Error restoring backup:", error)
      setRestoring(false)
      setProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!isPro) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Backup y Restauración
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Pro</Badge>
          </CardTitle>
          <CardDescription>Protege tus datos con backups automáticos y manuales</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Backup Profesional</h3>
          <p className="text-gray-600 mb-6">
            Mantén tus datos seguros con backups automáticos y restauración instantánea
          </p>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Backups automáticos diarios</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Restauración con un clic</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Historial de 30 días</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Exportación de datos</span>
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
                <Shield className="w-5 h-5" />
                Backup y Restauración
              </CardTitle>
              <CardDescription>Mantén tus datos seguros con backups regulares</CardDescription>
            </div>
            <Button onClick={createBackup} disabled={creating || restoring} className="gap-2">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {creating ? "Creando..." : "Crear Backup"}
            </Button>
          </div>
        </CardHeader>

        {(creating || restoring) && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{creating ? "Creando backup..." : "Restaurando datos..."}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Configuración de backups automáticos */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Backups Automáticos
          </CardTitle>
          <CardDescription>Configuración de backups programados</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Los backups automáticos están activados. Se crean diariamente a las 2:00 AM UTC.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Lista de backups */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Historial de Backups
          </CardTitle>
          <CardDescription>Tus backups más recientes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay backups</h3>
              <p className="text-gray-600 mb-4">Crea tu primer backup para proteger tus datos</p>
              <Button onClick={createBackup} className="gap-2">
                <Download className="w-4 h-4" />
                Crear Primer Backup
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Backup {new Date(backup.created_at).toLocaleDateString("es-ES")}
                        </span>
                        <Badge variant={backup.backup_type === "automatic" ? "default" : "secondary"}>
                          {backup.backup_type === "automatic" ? "Automático" : "Manual"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatFileSize(backup.file_size)}</span>
                        <span>{new Date(backup.created_at).toLocaleTimeString("es-ES")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadBackup(backup)} className="gap-2">
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreBackup(backup)}
                      disabled={restoring}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Restaurar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
