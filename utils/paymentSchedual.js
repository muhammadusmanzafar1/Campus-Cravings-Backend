const cron = require('node-cron');
const PlatformShare = require('../src/campusCravings/admin/models/platformShare');
const stripe = require('./stripe')
const User = require('../src/auth/models/user');
const Order = require('../src/campusCravings/admin/models/order');

async function processPayouts() {
  try {
    const orders = await Order.find({ transfer_to_account: false, status: 'delivered' })
      .sort({ created_at: 1 })
      .populate('restaurant_id')
      .populate('assigned_to');

    const balance = await stripe.balance.retrieve();
    const available = balance.available.find(b => b.currency === 'usd')?.amount || 0;

    console.log(`Starting payout job for ${orders.length} orders...`);

    for (const order of orders) {
      try {
        const rider = order.assigned_to;
        const restaurant = order.restaurant_id;

        if (!rider || !restaurant) {
          console.warn(`Order ${order._id}: Missing rider or restaurant`);
          continue;
        }

        const riderUser = await User.findById(rider.user);
        const restaurantUser = await User.findOne({ restaurant });

        if (!riderUser?.stripeAccountId || !restaurantUser?.stripeAccountId) {
          console.warn(`Order ${order._id}: Missing Stripe account for rider or restaurant`);
          continue;
        }

        const orderPrice = order.order_price || 0;
        const platformFee = orderPrice * 0.10 * 100;
        const restaurantShare = orderPrice * 100;
        const riderShare = (order.delivery_fee + order.tip) * 100;

        const totalPlatformEarnings = await PlatformShare.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const adminTotal = totalPlatformEarnings[0]?.total || 0;

        if (available < adminTotal + riderShare + restaurantShare) {
          console.warn(`Order ${order._id}: Insufficient balance in Stripe`);
          continue;
        }

        await PlatformShare.create({
          orderId: order._id,
          amount: platformFee,
          currency: 'usd'
        });

        try {
          await stripe.transfers.create({
            amount: restaurantShare,
            currency: 'usd',
            destination: restaurantUser.stripeAccountId,
            description: `Restaurant payout for order ${order._id}`,
            transfer_group: `${order._id}`,
            metadata: {
              orderId: order._id.toString(),
            }
          });

          await stripe.transfers.create({
            amount: riderShare,
            currency: 'usd',
            destination: riderUser.stripeAccountId,
            description: `Rider payout for order ${order._id}`,
            transfer_group: `${order._id}`,
            metadata: {
              orderId: order._id.toString(),
            }
          });
          
          await order.save();

          console.log(`Order ${order._id}: Payout successful`);
        } catch (stripeErr) {
          console.error(`Order ${order._id}: Stripe transfer error - ${stripeErr?.message}`);
          continue;
        }
      } catch (orderErr) {
        console.error(`General error processing order ${order._id}:`, orderErr.message);
        continue;
      }
    }

    console.log('Daily payout job completed.');
  } catch (fatalErr) {
    console.error('Fatal error in payout cron job:', fatalErr.message);
  }
}


function startCronJobs() {
  cron.schedule('0 21 * * *', () => {
    console.log('Starting daily payout job at 9 PM');
    processPayouts();
  });
}

module.exports = startCronJobs;