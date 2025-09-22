import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "https://loan881.github.io"); 
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Réponse immédiate pour la pré-requête CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Autorise seulement POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cart, customer } = req.body;

    // Exemple de calcul simple : 20€ par article
    const amount = cart.reduce((sum, item) => sum + item.qty * 2000, 0);

    // Création du PaymentIntent Stripe
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

    // Retour du clientSecret pour Stripe.js
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    res.status(500).json({ error: err.message });
  }
}

