import Stripe from "stripe";

// Initialise Stripe avec ta clé secrète depuis les variables d'environnement Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // en dev tu peux mettre * pour tester
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Réponse aux requêtes preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Refuser toute méthode sauf POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cart, customer } = req.body || {};

    if (!cart || !customer) {
      return res.status(400).json({ error: "Requête invalide : cart ou customer manquant" });
    }

    // Exemple simple : 20 € par article
    const amount = cart.reduce((sum, item) => sum + item.qty * 2000, 0);

    // Création d’un PaymentIntent
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

    // Retourne le client_secret au frontend
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    return res.status(500).json({ error: err.message });
  }
}
