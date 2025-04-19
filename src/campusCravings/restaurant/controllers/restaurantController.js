'use strict'
const restaurantService = require('../services/restaurantService');
const asyncHandler = require('express-async-handler');
const ApiError = require("../../../../utils/ApiError");

exports.getRestaurantAnalytics = asyncHandler(async (req, res, next) => {
    try {
        const analytics = await restaurantService.getRestaurantAnalytics(req, res, next);
        return analytics;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.NOT_FOUND);
    }
});

// fetch nearby restaurants
exports.getnearbyRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await restaurantService.nearbyRestaurant(req);
    return restaurant;
})