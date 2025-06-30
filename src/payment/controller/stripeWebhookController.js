const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { handleTransferCreated, handlePayoutPaid } = require('../services/stripe.service');

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripeAccountId = req.headers['stripe-account'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook event received:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'transfer.created':
        await handleTransferCreated(event.data.object, stripeAccountId);
        break;
      case 'payout.paid':
        await handlePayoutPaid(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err.message);
    return res.status(500).send('Internal Server Error');
  }
};
