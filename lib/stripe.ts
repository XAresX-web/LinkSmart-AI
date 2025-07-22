import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export const plans = {
  free: {
    name: "Gratuito",
    price: 0,
    features: ["Hasta 5 enlaces", "Temas básicos", "Estadísticas básicas", "Subdominio enlacehub.com"],
  },
  pro: {
    name: "Pro",
    price: 9,
    priceId: "price_pro_monthly",
    features: [
      "Enlaces ilimitados",
      "Todos los temas premium",
      "Analytics avanzados",
      "Dominio personalizado",
      "Sin marca EnlaceHub",
      "Soporte prioritario",
      "Códigos QR personalizados",
      "Programación de enlaces",
      "A/B Testing",
      "Integraciones avanzadas",
    ],
  },
  business: {
    name: "Business",
    price: 19,
    priceId: "price_business_monthly",
    features: [
      "Todo de Pro",
      "Múltiples colaboradores",
      "API personalizada",
      "Webhooks",
      "Backups automáticos",
      "Soporte 24/7",
      "Consultoría personalizada",
      "White-label completo",
    ],
  },
}

export async function createCheckoutSession(priceId: string, customerId?: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?canceled=true`,
    customer: customerId,
  })

  return session
}

export async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  })

  return customer
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}

export default stripe
