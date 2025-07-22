import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession, createCustomer } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Obtener datos del usuario
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verificar si ya tiene un customer de Stripe
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single()

    let customerId = subscription?.stripe_customer_id

    // Crear customer si no existe
    if (!customerId) {
      const customer = await createCustomer(user.email, user.full_name)
      customerId = customer.id

      // Guardar customer_id en la base de datos
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan_type: "free",
        status: "active",
      })
    }

    // Crear sesión de checkout
    const session = await createCheckoutSession(priceId, customerId)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
