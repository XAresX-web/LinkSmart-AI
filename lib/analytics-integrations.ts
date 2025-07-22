import { supabase } from "./supabase"

export interface GoogleAnalyticsConfig {
  trackingId: string
  enhancedEcommerce: boolean
  customDimensions?: Record<string, string>
}

export interface FacebookPixelConfig {
  pixelId: string
  events: string[]
}

export interface MailchimpConfig {
  apiKey: string
  listId: string
  tags: string[]
}

export class AnalyticsIntegrations {
  static async saveIntegration(userId: string, service: string, config: any) {
    const { data, error } = await supabase
      .from("integrations")
      .upsert({
        user_id: userId,
        service,
        config,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getIntegrations(userId: string) {
    const { data, error } = await supabase.from("integrations").select("*").eq("user_id", userId).eq("is_active", true)

    if (error) throw error
    return data
  }

  static async toggleIntegration(userId: string, service: string, isActive: boolean) {
    const { error } = await supabase
      .from("integrations")
      .update({ is_active: isActive })
      .eq("user_id", userId)
      .eq("service", service)

    if (error) throw error
  }

  // Google Analytics
  static initializeGA(config: GoogleAnalyticsConfig) {
    if (typeof window === "undefined") return

    // Cargar script de Google Analytics
    const script = document.createElement("script")
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackingId}`
    document.head.appendChild(script)

    // Configurar gtag
    window.gtag =
      window.gtag ||
      (() => {
        ;(window.gtag.q = window.gtag.q || []).push(arguments)
      })
    window.gtag("js", new Date())
    window.gtag("config", config.trackingId, {
      enhanced_ecommerce: config.enhancedEcommerce,
      custom_map: config.customDimensions,
    })
  }

  static trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (typeof window === "undefined" || !window.gtag) return

    window.gtag("event", eventName, parameters)
  }

  // Facebook Pixel
  static initializeFacebookPixel(config: FacebookPixelConfig) {
    if (typeof window === "undefined") return

    // Cargar Facebook Pixel
    window.fbq =
      window.fbq ||
      (() => {
        ;(window.fbq.q = window.fbq.q || []).push(arguments)
      })
    window.fbq("init", config.pixelId)
    window.fbq("track", "PageView")

    const script = document.createElement("script")
    script.async = true
    script.src = "https://connect.facebook.net/en_US/fbevents.js"
    document.head.appendChild(script)
  }

  static trackFacebookEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (typeof window === "undefined" || !window.fbq) return

    window.fbq("track", eventName, parameters)
  }
}

// Declaraciones globales para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
  }
}
