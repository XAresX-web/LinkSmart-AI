import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = headers()
  const sig = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(deletedSubscription)
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSuccess(invoice)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailure(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Obtener el usuario por customer_id
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!existingSubscription) {
    console.error("No user found for customer:", customerId)
    return
  }

  // Determinar el tipo de plan
  let planType = "free"
  if (subscription.items.data[0]?.price.id === "price_pro_monthly") {
    planType = "pro"
  } else if (subscription.items.data[0]?.price.id === "price_business_monthly") {
    planType = "business"
  }

  // Actualizar suscripción
  await supabase.from("subscriptions").upsert({
    user_id: existingSubscription.user_id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan_type: planType,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Crear notificación
  await supabase.from("notifications").insert({
    user_id: existingSubscription.user_id,
    title: "Suscripción actualizada",
    message: `Tu plan ${planType.toUpperCase()} está ahora activo.`,
    type: "success",
  })
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!existingSubscription) return

  // Actualizar a plan gratuito
  await supabase
    .from("subscriptions")
    .update({
      plan_type: "free",
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId)

  // Crear notificación
  await supabase.from("notifications").insert({
    user_id: existingSubscription.user_id,
    title: "Suscripción cancelada",
    message: "Tu suscripción ha sido cancelada. Has vuelto al plan gratuito.",
    type: "warning",
  })
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!subscription) return

  // Crear notificación de pago exitoso
  await supabase.from("notifications").insert({
    user_id: subscription.user_id,
    title: "Pago procesado",
    message: `Tu pago de €${(invoice.amount_paid / 100).toFixed(2)} ha sido procesado exitosamente.`,
    type: "success",
  })
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!subscription) return

  // Crear notificación de pago fallido
  await supabase.from("notifications").insert({
    user_id: subscription.user_id,
    title: "Error en el pago",
    message: "Hubo un problema procesando tu pago. Por favor, actualiza tu método de pago.",
    type: "error",
    action_url: "/dashboard/billing",
  })
}
