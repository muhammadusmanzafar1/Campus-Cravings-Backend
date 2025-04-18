const httpStatus = require("http-status");
const ApiError = require("../../../../utils/ApiError");
const Order = require("../../admin/models/order");
const Restaurant = require("../models/restaurant");
const mongoose = require("mongoose");

exports.getRestaurantAnalytics = async (req, res, next) => {
    
    const { restaurantId } = req.userId;

    try {
        if (!restaurantId) {
            throw new ApiError("Restaurant ID is required", httpStatus.BAD_REQUEST);
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

        res.status(httpStatus.OK).json(response);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
