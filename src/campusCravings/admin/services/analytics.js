const User = require('../../../auth/models/user');
const Order = require('../models/order');
const { getGrowthPercentage } = require('../helpers/AnalyticHelper');
const getAnalytics = async (req) => {
    try {
        const duration = parseInt(req.params.days) || 7;
        if (isNaN(duration) || duration <= 0) throw new Error('Invalid duration, please provide a positive integer.');
        const now = new Date();
        const currentStart = new Date(now.getTime() - duration * 24 * 60 * 60 * 1000);
        const previousStart = new Date(currentStart.getTime() - duration * 24 * 60 * 60 * 1000);
        const orderStatusFilter = { status: { $in: ['delivered', 'completed'] } };
        const [
            currentUsers,
            previousUsers,
            currentActiveUsers,
            previousActiveUsers,
            currentOrders,
            previousOrders,
            totalUsers
        ] = await Promise.all([
            User.countDocuments({ role: 'user', createdAt: { $gte: currentStart } }),
            User.countDocuments({ role: 'user', createdAt: { $gte: previousStart, $lt: currentStart } }),
            User.countDocuments({ role: 'user', status: 'active', createdAt: { $gte: currentStart } }),
            User.countDocuments({ role: 'user', status: 'active', createdAt: { $gte: previousStart, $lt: currentStart } }),
            Order.countDocuments({ ...orderStatusFilter, createdAt: { $gte: currentStart } }),
            Order.countDocuments({ ...orderStatusFilter, createdAt: { $gte: previousStart, $lt: currentStart } }),
            User.countDocuments({ role: 'user' })
        ]);
        const [currentRevenueAgg, previousRevenueAgg] = await Promise.all([
            Order.aggregate([
                { $match: { ...orderStatusFilter, createdAt: { $gte: currentStart } } },
                { $group: { _id: null, total: { $sum: '$total_price' } } }
            ]),
            Order.aggregate([
                { $match: { ...orderStatusFilter, createdAt: { $gte: previousStart, $lt: currentStart } } },
                { $group: { _id: null, total: { $sum: '$total_price' } } }
            ])
        ]);
        const currentRevenue = currentRevenueAgg[0]?.total || 0;
        const previousRevenue = previousRevenueAgg[0]?.total || 0;
        return {
            totalUsers,
            totalActiveUsers: currentActiveUsers,
            totalOrdersProcessed: currentOrders,
            totalRevenue: currentRevenue,
            userGrowthPercent: getGrowthPercentage(currentUsers, previousUsers),
            activeUserGrowthPercent: getGrowthPercentage(currentActiveUsers, previousActiveUsers),
            orderGrowthPercent: getGrowthPercentage(currentOrders, previousOrders),
            revenueGrowthPercent: getGrowthPercentage(currentRevenue, previousRevenue)
        };

    } catch (error) {
        throw new Error('Error fetching analytics: ' + error.message);
    }
};
module.exports = {
    getAnalytics
};