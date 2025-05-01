const Order = require('../../campusCravings/admin/models/order');
const User = require('../../auth/models/user');


const { sendPayoutsOnOrderDelivered, createStripeAccount, generateOnboardingLink } = require('../services/stripeService');

const startStripeOnboarding = async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.stripeAccountId) {
        user.stripeAccountId = await createStripeAccount(user.email);
        await user.save();
    }

    const onboardingUrl = await generateOnboardingLink(
        user.stripeAccountId,
        'http://localhost:5173',
        'http://localhost:5173'
    );

    if (user.isRestaurant || user.isRider) {
        user.status = 'active';
        await user.save();
    }

    return { url: onboardingUrl };
};

const handleOrderDelivered = async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
        .populate('restaurant')
        .populate('rider');

    if (!order || order.status !== 'delivered') {
        return res.status(400).json({ message: 'Invalid order status' });
    }

    const result = await sendPayoutsOnOrderDelivered({
        id: order._id,
        riderStripeId: order.rider.stripeAccountId,
        restaurantStripeId: order.restaurant.stripeAccountId,
        itemAmount: order.itemTotal,
        riderAmount: order.riderFee,
        platformFee: order.platformFee,
    });

    res.json({ message: 'Payouts done', result });
};

module.exports = { handleOrderDelivered, startStripeOnboarding };
