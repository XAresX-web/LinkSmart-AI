"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2 } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  action_url?: string
  created_at: string
}

export function NotificationsCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    loadNotifications()

    // Suscribirse a nuevas notificaciones en tiempo real
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

      if (error) throw error

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const filteredNotifications = notifications.filter((n) => filter === "all" || !n.is_read)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Mantente al día con las últimas actualizaciones</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilter(filter === "all" ? "unread" : "all")}>
              {filter === "all" ? "Solo no leídas" : "Todas"}
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "unread" ? "No hay notificaciones sin leer" : "No hay notificaciones"}
              </h3>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "Todas tus notificaciones están al día"
                  : "Te notificaremos cuando haya algo nuevo"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                    notification.is_read ? "bg-white" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`text-sm font-medium ${
                            notification.is_read ? "text-gray-900" : "text-gray-900 font-semibold"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString("es-ES")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {notification.action_url && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-purple-600 hover:text-purple-700"
                        onClick={() => window.open(notification.action_url, "_blank")}
                      >
                        Ver más →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
