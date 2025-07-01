const Order = require('../../campusCravings/admin/models/order');
const User = require('../../auth/models/user');
const Rider = require('../../campusCravings/rider/models/rider');
const ApiError = require('../../../utils/ApiError');


const { sendPayoutsOnOrderDelivered, createStripeAccount, generateOnboardingLink } = require('../services/stripeService');

const startStripeOnboarding = async (req, res) => {
    const { userId } = req.params;
    const { failureUrl, successUrl } = req.query;

    if (!failureUrl || !successUrl) {
        throw new ApiError('Missing required query parameters: failureUrl or successUrl');
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    const rider = await Rider.findOne({'user':userId});
    // if (!rider) throw new ApiError('Rider not found', 404);


    if (!user.stripeAccountId) {
        user.stripeAccountId = await createStripeAccount(user.email);
        await user.save();
    }

    const onboardingUrl = await generateOnboardingLink(
        user.stripeAccountId,
        failureUrl,
        successUrl
    );

    if (user.isRestaurant) {
        user.status = 'active';
        await user.save();
    } else if (rider) {
        user.isDelivery = true;
        rider.status = 'active';
        await rider.save();
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
