'use strict'
const restaurantService = require('../services/restaurantService');
const httpStatus = require('http-status');
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

exports.getAllCategoryByRestaurantId = asyncHandler(async (req, res, next) => {
    try {
        const categories = await restaurantService.getAllCategoryByRestaurantId(req, res, next);
        return categories;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.NOT_FOUND);
    }
});


exports.getAllRestaurant = asyncHandler(async (req, res, next) => {
    try {
        const restaurant = await restaurantService.getAllRestaurant(req, res, next);
        return restaurant;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.NOT_FOUND);
    }
});


exports.getTwentyMilesRestaurents = asyncHandler(async (req, res, next) => {
    try {
        const restaurant = await restaurantService.getNearbyRestaurantsWithCategories(req, res, next);
        return restaurant;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.NOT_FOUND);
    }
});

exports.getpoplarFoodItems = asyncHandler(async (req, res, next) => {
    try {
        const restaurant = await restaurantService.getpoplarFoodItems(req, res, next);
        return restaurant;
    } catch (error) {
        throw new ApiError(error.message, httpStatus.status.NOT_FOUND);
    }
});