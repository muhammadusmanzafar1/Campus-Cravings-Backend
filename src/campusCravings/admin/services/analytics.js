const User = require('../../../auth/models/user');
const mongoose = require('mongoose');
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
            User.countDocuments({ isCustomer: true, created_at: { $gte: currentStart } }),
            User.countDocuments({ isCustomer: true, created_at: { $gte: previousStart, $lt: currentStart } }),
            User.countDocuments({ isCustomer: true, status: 'active', created_at: { $gte: currentStart } }),
            User.countDocuments({ isCustomer: true, status: 'active', created_at: { $gte: previousStart, $lt: currentStart } }),
            Order.countDocuments({ ...orderStatusFilter, created_at: { $gte: currentStart } }),
            Order.countDocuments({ ...orderStatusFilter, created_at: { $gte: previousStart, $lt: currentStart } }),
            User.countDocuments({ isCustomer: true })
        ]);
        const [currentRevenueAgg, previousRevenueAgg] = await Promise.all([
            Order.aggregate([
                { $match: { ...orderStatusFilter, created_at: { $gte: currentStart } } },
                { $group: { _id: null, total: { $sum: '$total_price' } } }
            ]),
            Order.aggregate([
                { $match: { ...orderStatusFilter, created_at: { $gte: previousStart, $lt: currentStart } } },
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
const getRevenueAnalytics = async (req) => {
    try {
        const duration = req.params.timeframe || 'week';
        const now = new Date();
        const matchStage = {
            status: { $in: ['delivered', 'completed'] },
            created_at: {}
        };

        let groupStage = {};
        let startDate;
        let labels = [];
        let resultMap = {};

        switch (duration) {
            case 'week':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
                matchStage.created_at = { $gte: startDate };
                groupStage = {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                    totalRevenue: { $sum: '$total_price' }
                };

                // Generate last 7 day labels
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                    labels.push(date.toISOString().split('T')[0]);
                }
                break;

            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27);
                matchStage.created_at = { $gte: startDate };
                groupStage = {
                    _id: { $isoWeek: '$created_at' },
                    totalRevenue: { $sum: '$total_price' }
                };
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                break;

            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                matchStage.created_at = { $gte: startDate };
                groupStage = {
                    _id: { $month: '$created_at' },
                    totalRevenue: { $sum: '$total_price' }
                };
                labels = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                break;

            case 'all':
                delete matchStage.created_at;
                groupStage = {
                    _id: { $year: '$created_at' },
                    totalRevenue: { $sum: '$total_price' }
                };
                break;

            default:
                throw new Error('Invalid duration. Use week, month, year, or all.');
        }

        const revenueData = await Order.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: { _id: 1 } }
        ]);

        // Build result map for easy lookup
        for (const record of revenueData) {
            resultMap[record._id] = record.totalRevenue;
        }

        let result = [];

        if (duration === 'week') {
            result = labels.map(date => ({
                label: date,
                revenue: resultMap[date] || 0
            }));
        } else if (duration === 'month') {
            let weekNums = revenueData.map(d => d._id);
            for (let i = 1; i <= 4; i++) {
                const label = `Week ${i}`;
                const value = revenueData.find(r => r._id === weekNums[i - 1]);
                result.push({
                    label,
                    revenue: value?.totalRevenue || 0
                });
            }
        } else if (duration === 'year') {
            for (let i = 1; i <= 12; i++) {
                result.push({
                    label: labels[i - 1],
                    revenue: resultMap[i] || 0
                });
            }
        } else if (duration === 'all') {
            result = Object.keys(resultMap).map(year => ({
                label: year,
                revenue: resultMap[year] || 0
            }));
        }

        return result;
    } catch (error) {
        throw new Error('Error fetching analytics: ' + error.message);
    }
};

// Resturant Analytics
const getResturantAnalytics = async (req) => {
    try {
        const restaurantId = new mongoose.Types.ObjectId(req.params.restaurantId);
        const duration = parseInt(req.params.days) || 7;
        if (isNaN(duration) || duration <= 0) throw new Error('Invalid duration, please provide a positive integer.');
        const now = new Date();
        const currentStart = new Date(now.getTime() - duration * 24 * 60 * 60 * 1000);
        const previousStart = new Date(currentStart.getTime() - duration * 24 * 60 * 60 * 1000);
        const orderStatusFilter = { status: { $in: ['delivered', 'completed'] } };
        const [
            currentOrders,
            previousOrders
        ] = await Promise.all([
            Order.countDocuments({ ...orderStatusFilter, restaurant_id: restaurantId, created_at: { $gte: currentStart } }),
            Order.countDocuments({ ...orderStatusFilter, restaurant_id: restaurantId, created_at: { $gte: previousStart, $lt: currentStart } }),
        ]);
        const [currentRevenueAgg, previousRevenueAgg] = await Promise.all([
            Order.aggregate([
                { $match: { ...orderStatusFilter, restaurant_id: restaurantId, created_at: { $gte: currentStart } } },
                { $group: { _id: null, total: { $sum: '$total_price' } } }
            ]),
            Order.aggregate([
                { $match: { ...orderStatusFilter, restaurant_id: restaurantId, created_at: { $gte: previousStart, $lt: currentStart } } },
                { $group: { _id: null, total: { $sum: '$total_price' } } }
            ])
        ]);
        const currentRevenue = currentRevenueAgg[0]?.total || 0;
        const previousRevenue = previousRevenueAgg[0]?.total || 0;
        // Also need to send total view when schema is ready 
        return {
            totalOrdersProcessed: currentOrders,
            totalRevenue: currentRevenue,
            orderGrowthPercent: getGrowthPercentage(currentOrders, previousOrders),
            revenueGrowthPercent: getGrowthPercentage(currentRevenue, previousRevenue)
        };

    } catch (error) {
        throw new Error('Error fetching analytics: ' + error.message);
    }
};
// Get top Restaurants
const getTopRestaurants = async (req) => {
    try {
        const isAdmin = req.user?.isAdmin;
        if (!isAdmin) {
            throw new ApiError("Unauthorized", httpStatus.status.UNAUTHORIZED);
        }
        const orderStatusFilter = { status: { $in: ['delivered', 'completed'] } };
        const topRestaurants = await Order.aggregate([
            { $match: { ...orderStatusFilter } },
            {
                $group: {
                    _id: '$restaurant_id',
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 6 },
            {
                $lookup: {
                    from: 'restaurants', 
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            {
                $unwind: '$restaurant'
            },
            {
                $project: {
                    _id: 0,
                    restaurant_id: '$_id',
                    total: 1,
                    storeName: '$restaurant.storeName'
                }
            }
        ]);
        return topRestaurants;
    } catch (error) {
        throw new Error('Error fetching analytics: ' + error.message);
    }
};
module.exports = {
    getAnalytics,
    getRevenueAnalytics,
    getResturantAnalytics,
    getTopRestaurants
};