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