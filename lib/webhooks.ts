import crypto from "crypto"
import { supabase } from "./supabase"

export interface WebhookEvent {
  type: string
  data: any
  timestamp: string
  user_id: string
}

export class WebhookManager {
  static async createWebhook(userId: string, url: string, events: string[]) {
    const secret = crypto.randomBytes(32).toString("hex")

    const { data, error } = await supabase
      .from("webhooks")
      .insert({
        user_id: userId,
        url,
        events,
        secret,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserWebhooks(userId: string) {
    const { data, error } = await supabase.from("webhooks").select("*").eq("user_id", userId).eq("is_active", true)

    if (error) throw error
    return data
  }

  static async triggerWebhook(webhookId: string, event: WebhookEvent) {
    const { data: webhook } = await supabase.from("webhooks").select("*").eq("id", webhookId).single()

    if (!webhook || !webhook.is_active) return

    try {
      const signature = this.generateSignature(JSON.stringify(event), webhook.secret)

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-EnlaceHub-Signature": signature,
          "X-EnlaceHub-Event": event.type,
        },
        body: JSON.stringify(event),
      })

      // Actualizar última activación
      await supabase.from("webhooks").update({ last_triggered: new Date().toISOString() }).eq("id", webhookId)

      return response.ok
    } catch (error) {
      console.error("Webhook error:", error)
      return false
    }
  }

  static generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex")
  }

  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  }
}
