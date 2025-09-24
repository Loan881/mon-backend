import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Ajout des headers CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Si la requête est un preflight (OPTIONS), on répond tout de suite
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // On bloque tout sauf POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cart, customer } = req.body;

    if (!cart || !customer) {
      return res.status(400).json({ error: "Requête invalide" });
    }

    // Exemple calcul total : 20€ par article
    const amount = cart.reduce((sum, item) => sum + item.qty * 2000, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      receipt_email: customer.email,
      metadata: {
        cart: JSON.stringify(cart),
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    res.status(500).json({ error: err.message });
  }
}
