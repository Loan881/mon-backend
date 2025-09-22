import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // accepte toutes les origines (test)
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 👉 Debug console
  console.log("Requête reçue:", req.method, req.url);

  if (req.method === "OPTIONS") {
    console.log("Réponse preflight OPTIONS envoyée");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    console.log("Méthode refusée:", req.method);
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cart, customer } = req.body || {};

    if (!cart || !customer) {
      console.log("Requête invalide:", req.body);
      return res.status(400).json({ error: "Corps de requête manquant" });
    }

    // Exemple de calcul (20€ par article)
    const amount = cart.reduce((sum, item) => sum + item.qty * 2000, 0);

    console.log("Création PaymentIntent pour montant:", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      receipt_email: customer.email,
      metadata: {
        cart: JSON.stringify(cart),
        name: customer.firstName + " " + customer.lastName,
        email: customer.email,
      },
    });

    console.log("PaymentIntent créé:", paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    res.status(500).json({ error: err.message });
  }
}
