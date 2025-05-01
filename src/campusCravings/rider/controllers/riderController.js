'use strict'
const riderService = require('../services/riderService');
const httpStatus = require('http-status');
const asyncHandler = require('express-async-handler');
const ApiError = require("../../../../utils/ApiError");

exports.registerRider = asyncHandler(async (req, res, next) => {
    const data = await riderService.registerRider(req, res, next);
    return data;
});

exports.getUnassignedOrders = asyncHandler(async (req, res, next) => {
    const data = await riderService.getRandomUnassignedOrder(req, res, next);
    return data;
});

exports.deliverOrder = asyncHandler(async (req, res, next) => {
    const data = await riderService.deliverOrder(req, res, next);
    return data;
});

exports.updateLocation = asyncHandler(async (req, res, next) => {
    const data = await riderService.updateLocation(req, res, next);
    return data;
});

exports.orderAccept = asyncHandler(async (req, res) => {
    const data = await riderService.orderAccept(req, res);
    return data;
})
exports.riderLocation = asyncHandler(async (req, res) => {
    const data = await riderService.riderLocation(req, res);
    return data;
})
exports.getRiderDetails = asyncHandler(async (req, res) => {
    const data = await riderService.getRiderDetails(req, res);
    return data;
})