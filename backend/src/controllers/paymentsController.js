const { createCheckoutSession, verifyWebhookSignature } = require('../services/stripeService');

async function checkout(req, res) {
  const { projectId, amount } = req.body;
  const session = await createCheckoutSession({
    projectId,
    tenantId: req.user.tenantId,
    amount
  });

  return res.json({ url: session.url, id: session.id });
}

async function webhook(req, res) {
  const signature = req.headers['stripe-signature'];
  try {
    const event = verifyWebhookSignature(req.rawBody, signature);
    if (event.type === 'checkout.session.completed') {
      // Persist payment success and update project status in DB.
      // Keep this logic idempotent using unique payment ids.
    }
    return res.json({ received: true });
  } catch (error) {
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
}

module.exports = { checkout, webhook };
