const stripe = require('../../../utils/stripe')
const User = require('../../auth/models/user');
const Rider = require('../../campusCravings/rider/models/rider');
const PayoutLog = require('../../campusCravings/admin/models/payoutLog');
const Order = require('../../campusCravings/admin/models/order');
const PlatformShare = require('../../campusCravings/admin/models/platformShare');
const { log } = require('winston');

exports.handleTransferCreated = async (orderId, stripeAccountId) => {
  try {
    const user = await User.findOne({ stripeAccountId });

    const order_id = orderId.startsWith('order_') ? orderId.split('order_')[1] : orderId;

    if (!user) {
      console.warn(`No user found with Stripe account ${stripeAccountId}`);
      return;
    }

    if (user.isRestaurant && user.restaurant) {
      const order = await Order.findOne({ _id: order_id, restaurant_id: user.restaurant });
      if (order) {
        order.transfer_to_restaurant = true;
        await order.save();
        console.log(`Marked order ${order._id} as transferred to restaurant`);

        await triggerManualPayout(stripeAccountId);
      }
    } else if (user.isDelivery) {
      const rider = await Rider.findOne({ user: user._id });
      if (rider) {
        const order = await Order.findOne({ _id: order_id, assigned_to: rider._id });
        if (order) {
          order.transfer_to_rider = true;
          await order.save();
          console.log(`Marked order ${order._id} as transferred to rider`);

          await triggerManualPayout(stripeAccountId);
        }
      }
    } else {
      console.warn(`User with Stripe account ${stripeAccountId} has unknown role.`);
    }
  } catch (err) {
    console.error(`Error in handleTransferCreated:`, err.message);
  }
};

async function triggerManualPayout(stripeAccountId) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId
    });

    const usdBalance = balance.available.find(b => b.currency === 'usd')?.amount || 0;

    if (usdBalance < 100) {
      console.warn(`Not enough balance in ${stripeAccountId} to trigger payout.`);
      return;
    }

    const totalPlatformEarnings = await PlatformShare.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const adminTotal = totalPlatformEarnings[0]?.total || 0;
    const availableBalance = await stripe.balance.retrieve();
    console.log(">>>>>>>>>>>>>>>>>>>>>>>adminTotal", adminTotal);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>usdBalance", usdBalance);
    
    let payout;

    if (availableBalance <= adminTotal) {

      payout = await stripe.payouts.create({
        amount: usdBalance,
        currency: 'usd',
      }, {
        stripeAccount: stripeAccountId
      });
    } else {
      console.warn(`Insufficient balance in ${stripeAccountId} to cover platform fees.`);
    }
    console.log(`Payout of $${usdBalance / 100} created for ${stripeAccountId}: ${payout.id}`);
  } catch (err) {
    console.error(`Failed to create payout for ${stripeAccountId}:`, err.message);
  }
}

exports.handlePayoutPaid = async (payout) => {
  try {
    const orderId = payout.transfer_group;
    const order_id = orderId?.startsWith('order_') ? orderId.split('order_')[1] : orderId;

    if (!order_id) {
      console.warn('Missing or invalid transfer_group in payout');
      return;
    }

    const user = await User.findOne({ stripeAccountId: payout.destination });

    if (!user) {
      console.warn(` No user found with Stripe account ${payout.destination}`);
      return;
    }

    const amount = payout.amount / 100;

    if (user.isRestaurant && user.restaurant) {
      try {
        const order = await Order.findOne({ _id: order_id, restaurant_id: user.restaurant });

        if (!order) {
          console.warn(`Order not found for restaurant user: ${order_id}`);
          return;
        }

        order.payouts.restaurant.status = 'paid';
        order.payouts.restaurant.amount = amount;
        await order.save();

        await new PayoutLog({
          order_id: order._id,
          recipient_type: 'restaurant',
          recipient_id: user.restaurant,
          amount,
          status: 'paid',
          stripe_transfer_id: payout.id,
          metadata: payout,
        }).save();

        console.log(`Restaurant payout logged for order ${order._id}`);
      } catch (err) {
        console.error(`Error handling restaurant payout for order ${order_id}:`, err.message);
      }

    } else if (user.isDelivery) {
      try {
        const rider = await Rider.findOne({ user: user._id });

        if (!rider) {
          console.warn(`Rider not found for user ${user._id}`);
          return;
        }

        const order = await Order.findOne({ _id: order_id, assigned_to: rider._id });

        if (!order) {
          console.warn(`Order not found for rider user: ${order_id}`);
          return;
        }

        order.payouts.rider.status = 'paid';
        order.payouts.rider.amount = amount;
        await order.save();

        await new PayoutLog({
          order_id: order._id,
          recipient_type: 'rider',
          recipient_id: rider._id,
          amount,
          status: 'paid',
          stripe_transfer_id: payout.id,
          metadata: payout,
        }).save();

        console.log(`Rider payout logged for order ${order._id}`);
      } catch (err) {
        console.error(`Error handling rider payout for order ${order_id}:`, err.message);
      }

    } else {
      console.warn(`User with Stripe account ${payout.destination} has unknown role.`);
    }

  } catch (fatalError) {
    console.error(`Fatal error in handlePayoutPaid:`, fatalError.message);
  }
};

