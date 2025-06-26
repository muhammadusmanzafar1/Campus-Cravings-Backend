const Stripe = require('stripe');
const User = require('../../auth/models/user');
const Rider = require('../../campusCravings/rider/models/rider');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(
        req.body, // Use raw body here
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('Webhook event received:', event.type);
      
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle onboarding completion
    if (event.type === 'account.updated') {
      const account = event.data.object;
  
      if (account.details_submitted) {
        try {
          const user = await User.findOne({ stripeAccountId: account.id });
          if (user) {
            if (user.isRestaurant) {
              user.status = 'active';
              await user.save();
            } else {
              const rider = await Rider.findOne({ user: user._id });
              if (rider) {
                user.isDelivery = true;
                await user.save();
  
                rider.status = 'active';
                await rider.save();
              }
            }
          }
        } catch (err) {
          console.error('Error updating user after onboarding:', err.message);
          return res.status(500).send('Internal Server Error');
        }
      }
    }
  
    return 'Event received';
  };