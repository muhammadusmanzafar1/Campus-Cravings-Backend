'use strict';
const orderService = require('../services/order');
const asyncHandler = require('express-async-handler');

exports.getAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getAllOrders(req.body);
    return orders;
});

exports.createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req);
    return order;
});

exports.patchOrder = asyncHandler(async (req, res) => {
    const order = await orderService.patchOrder(req.params.id, req.body);
    return order;
});

exports.deleteOrder = asyncHandler(async (req, res) => {
    const order = await orderService.deleteOrder(req.params.id);
    return order;
});

exports.getOrder = asyncHandler(async (req, res) => {
    const order = await orderService.getOrder(req.params.id);
    return order;
});
// Resturant All Orders
exports.getResturantAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getResturantAllOrders(req);
    return orders;
});