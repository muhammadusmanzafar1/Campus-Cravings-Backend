const httpStatus = require("http-status");
const ApiError = require("../../../../utils/ApiError");
const Order = require("../../admin/models/order");
const Restaurant = require("../models/restaurant");
const Category = require("../models/category");
const mongoose = require("mongoose");
const Item = require("../../restaurant/models/items");
const { getGrowthPercentage } = require('../../admin/helpers/AnalyticHelper');

exports.getRestaurantAnalytics = async (req, res, next) => {

    const { restaurantId } = req.userId;

    try {
        if (!restaurantId) {
            throw new ApiError("Restaurant ID is required", httpStatus.status.BAD_REQUEST);
        }

        const analytics = await Order.aggregate([
            {
                $match: { restaurant_id: mongoose.Types.ObjectId.createFromHexString(restaurantId) }
            },
            {
                $group: {
                    _id: "$restaurant_id",
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: "$total_price" },
                }
            }
        ]);

        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            throw new ApiError(httpStatus.NOT_FOUND, "Restaurant not found");
        }

        const viewCount = restaurant.view_count;

        if (analytics.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, "No orders found for this restaurant");
        }

        const response = {
            restaurantId,
            orderCount: analytics[0].orderCount,
            totalRevenue: analytics[0].totalRevenue,
            viewCount: viewCount,
        };

        return response;
    } catch (error) {
        console.error(error);
        next(error);
    }
};
exports.getAllCategoryByRestaurantId = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            throw new ApiError("Invalid restaurant ID", httpStatus.status.BAD_REQUEST);
        }

        const categories = await Category.find({ restaurant: restaurantId })
            .populate('items');

        if (!categories || categories.length === 0) {
            throw new ApiError("No categories found for this restaurant", httpStatus.status.NOT_FOUND);
        }

        return categories;
    } catch (error) {
        console.error('Error occurred while fetching categories:', error);
        next(
            new ApiError(
                error.message || "Something went wrong",
                error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR
            )
        );
    }
};
exports.getAllRestaurant = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;
        const categories = await Category.find({ restaurant: restaurantId });

        if (!categories || categories.length === 0) {
            throw new ApiError("No category Found", httpStatus.status.NOT_FOUND);
        }

        return res.status(200).json(categories);
    } catch (error) {
        console.error('Error occurred while fetching categories:', error);
        next(error);
    }
};
exports.getNearbyRestaurantsWithCategories = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.query;

        const distanceInMeters = 20 * 1609.34;

        const restaurants = await Restaurant.find({
            "addresses.coordinates": {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    $maxDistance: distanceInMeters,
                }
            },
        }).populate('categories');

        return restaurants;
    } catch (error) {
        console.error('Error occurred while fetching categories:', error);
        next(error);
    }
};
exports.getpoplarFoodItems = async (req, res, next) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        throw new ApiError('Latitude and longitude are required', httpStatus.status.BAD_REQUEST)
    }
    try {
        const nearbyRestaurants = await Restaurant.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    distanceField: "distance",
                    maxDistance: 32186.9,
                    spherical: true
                }
            },
            { $project: { _id: 1 } }
        ]);


        if (!nearbyRestaurants.length) {
            throw new ApiError('No nearby restaurants found', httpStatus.status.NOT_FOUND)
        }

        const restaurantIds = nearbyRestaurants.map(r => r._id);

        const orders = await Order.aggregate([
            { $match: { restaurant_id: { $in: restaurantIds } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.item_id",
                    totalOrdered: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalOrdered: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            {
                $project: {
                    item_id: "$_id",
                    totalOrdered: 1,
                    itemDetails: { $arrayElemAt: ["$itemDetails", 0] }
                }
            }
        ]);

        if (!orders.length) {
            return res.status(404).json({ message: 'No popular items found' });
        }


        const popularItems = orders
            .filter(order => order.itemDetails)
            .map(order => ({ ...order
            }));


        return popularItems
    } catch (error) {
        console.error(error);
        throw new ApiError('An error occurred while fetching popular items', httpStatus.status.INTERNAL_SERVER_ERROR)
    }
};
exports.nearbyRestaurant = async (req) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            throw new ApiError("Missing required parameters: latitude and longitude are required.", httpStatus.status.BAD_REQUEST);
        }

        const radiusInMeters = 15 * 1609.34;

        const nearbyRestaurants = await Restaurant.find({
            'addresses.coordinates': {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: radiusInMeters,
                },
            },
        });
        return nearbyRestaurants;
    } catch (error) {
        console.error(error);
        throw new ApiError(error.message, httpStatus.status.BAD_REQUEST);
    }
};
// Search Restaurants or Food Items
exports.searchRestaurantsandFoodItems = async (req) => {
    try {
        const { latitude, longitude, search } = req.body;
        if (!latitude || !longitude || !search) {
            throw new ApiError("Missing required parameters: latitude, longitude and search are required.", httpStatus.status.BAD_REQUEST);
        }
        const radiusInMeters = 15 * 1609.34;
        const nearbyRestaurants = await Restaurant.find({
            'addresses.coordinates': {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: radiusInMeters,
                },
            },
        });
        const nearbyRestaurantIds = nearbyRestaurants.map(r => r._id);
        // Filter restaurants by search term (storeName or brandName)
        const filteredRestaurants = nearbyRestaurants.filter(r =>
            r.storeName.toLowerCase().includes(search.toLowerCase()) ||
            r.brandName.toLowerCase().includes(search.toLowerCase())
        );
        const matchedItems = await Item.find({
            restaurant: { $in: nearbyRestaurantIds },
            name: { $regex: search, $options: 'i' }
        }).populate('category');
        return {
            restaurants: filteredRestaurants,
            FoodItems: matchedItems
        };
    } catch (error) {
        console.error(error);
        throw new ApiError(error.message, httpStatus.BAD_REQUEST);
    }
};

// Resturant Analytics
exports.getResturantAnalytics = async (req) => {
    try {
        const restaurantId = req.user.restaurant;
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