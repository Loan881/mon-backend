import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "https://loan881.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    console.warn("❌ Mauvaise méthode:", req.method);
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cart, customer } = req.body;

    // Debug des données reçues
    console.log("📦 Cart reçu:", cart);
    console.log("👤 Client reçu:", customer);

    // Calcul simple (20€ par article)
    const amount = cart.reduce((sum, item) => sum + item.qty * 2000, 0);
    console.log("💶 Montant calculé:", amount);

    // Création du PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      receipt_email: customer.email,
      metadata: {
        cart: JSON.stringify(cart),
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email
      },
    });

    console.log("✅ PaymentIntent créé:", paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      debug: {
        receivedCart: cart,
        receivedCustomer: customer,
        calculatedAmount: amount
      }
    });
  } catch (err) {
    console.error("❌ Erreur Stripe:", err);
    res.status(500).json({ error: err.message });
  }
}
