const User = require('../../auth/models/user');
const Rider = require('../../campusCravings/rider/models/rider');
const PayoutLog = require('../../campusCravings/admin/models/payoutLog');
const Order = require('../../campusCravings/admin/models/order');

exports.handleTransferCreated = async (orderId, stripeAccountId) => {
  const user = await User.findOne({ stripeAccountId });

  const order_id = orderId.startsWith('order_') ? orderId.split('order_')[1] : orderId;

  if (!user) {
    console.warn(`No user found with Stripe account ${stripeAccountId}`);
    return;
  }

  if (user.isRestaurant && user.restaurant) {
    const order = await Order.findOne({_id: order_id, restaurant_id: user.restaurant});
    if (order) {
      order.transfer_to_account = true;
      await order.save();
    }
  } else if (user.isDelivery) {
    const rider = await Rider.findOne({ user: user._id });
    if (rider) {
      const order = await Order.findOne({ _id: order_id, assigned_to: rider._id });
      if (order) {
        order.transfer_to_account = true;
        await order.save();
      }
    }
  } else {
    console.warn(`User with Stripe account ${stripeAccountId} has unknown role.`);
  }
};

exports.handlePayoutPaid = async (payout) => {
  const orderId = payout.transfer_group;
  const order_id = orderId.startsWith('order_') ? orderId.split('order_')[1] : orderId;
  const user = await User.findOne({ stripeAccountId: payout.destination });

  if (!user) {
    console.warn(`No user found with Stripe account ${payout.destination}`);
    return;
  }

  const amount = payout.amount / 100;

  if (user.isRestaurant && user.restaurant) {
    const order = await Order.findOne({ _id: order_id, restaurant_id: user.restaurant });
    if (order) {
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
    }
  } else if (user.isDelivery) {
    const rider = await Rider.findOne({ user: user._id });
    if (rider) {
      const order = await Order.findOne({ _id: order_id, assigned_to: rider._id });
      if (order) {
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
      }
    }
  }
};
