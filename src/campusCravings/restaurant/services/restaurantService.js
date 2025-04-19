const httpStatus = require("http-status");
const ApiError = require("../../../../utils/ApiError");
const Order = require("../../admin/models/order");
const Restaurant = require("../models/restaurant");
const Category = require("../models/category");
const mongoose = require("mongoose");


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

        const categories = await Category.find({ restaurant: restaurantId });

        // If no categories found, throw an error
        if (!categories || categories.length === 0) {
            throw new ApiError("No categories found for this restaurant", httpStatus.status.NOT_FOUND);
        }

        return categories; // Return categories if found
    } catch (error) {
        // Directly throw the error to be handled in the controller
        throw new ApiError(error.message || "Something went wrong", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};



exports.getAllRestaurant = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;
        const categories = await Category.find({ restaurant: restaurantId });

        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: 'No categories found for this restaurant' });
        }

        return res.status(200).json(categories);
    } catch (error) {
        console.error('Error occurred while fetching categories:', error);
        next(error);
    }
};



exports.getNearbyRestaurantsWithCategories = async (req, res) => {
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

exports.getpoplarFoodItems = async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    try {
        const nearbyRestaurants = await Restaurant.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "distance",
                    maxDistance: 32186.9,
                    spherical: true
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ]);

        if (!nearbyRestaurants.length) {
            return res.status(404).json({ message: 'No nearby restaurants found' });
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

        const popularItems = orders.map(order => ({
            item_id: order.item_id,
            name: order.itemDetails.name,
            price: order.itemDetails.price,
            description: order.itemDetails.description,
            totalOrdered: order.totalOrdered,
            image: order.itemDetails.image,
        }));

        return res.status(200).json({ popularItems });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching popular items' });
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