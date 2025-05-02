
const stripe = require('../../../utils/stripe');

async function createStripeAccount(email) {
  const account = await stripe.accounts.create({
    email: email,
        controller: {
          fees: {
            payer: "application",
          },
          losses: {
            payments: "application",
          },
          stripe_dashboard: {
            type: "express",
          },
        },
      });
      return account.id;
    }

async function generateOnboardingLink(accountId, refreshUrl, returnUrl) {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  
    return link.url;
  }

async function sendPayoutsOnOrderDelivered(order) {
    const {
      id: orderId,
      riderStripeId,
      restaurantStripeId,
      itemAmount,   
      riderAmount,  
      platformFee   
    } = order;
  
    const riderTransfer = await stripe.transfers.create({
      amount: riderAmount,
      currency: 'usd',
      destination: riderStripeId,
      transfer_group: `ORDER_${orderId}`,
    });
  
    const restaurantTransfer = await stripe.transfers.create({
      amount: itemAmount - platformFee,
      currency: 'usd',
      destination: restaurantStripeId,
      transfer_group: `ORDER_${orderId}`,
    });
  
    return { riderTransfer, restaurantTransfer };
  }
  

module.exports = {
    sendPayoutsOnOrderDelivered,
    createStripeAccount,
    generateOnboardingLink,
};
