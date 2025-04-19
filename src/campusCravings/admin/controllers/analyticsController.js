'use strict';
const analyticsService = require('../services/analytics');
const asyncHandler = require('express-async-handler');

exports.getAnalytics = asyncHandler(async (req, res) => {
    const orders = await analyticsService.getAnalytics(req);
    return orders;
});

exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
    const orders = await analyticsService.getRevenueAnalytics(req);
    return orders;
});
// Resturant Analytics
exports.getResturantAnalytics = asyncHandler(async (req, res) => {
    const orders = await analyticsService.getResturantAnalytics(req);
    return orders;
});
// Top Restaurants
exports.getTopRestaurants = asyncHandler(async (req, res) => {
    const orders = await analyticsService.getTopRestaurants(req);
    return orders;
});