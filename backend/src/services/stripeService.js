const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession({ projectId, tenantId, amount, currency = 'usd' }) {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: `Project Payment ${projectId}`
          }
        },
        quantity: 1
      }
    ],
    metadata: {
      project_id: projectId,
      tenant_id: tenantId
    },
    success_url: 'https://example.com/payments/success',
    cancel_url: 'https://example.com/payments/cancel'
  });
}

function verifyWebhookSignature(payload, signature) {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = { createCheckoutSession, verifyWebhookSignature };
