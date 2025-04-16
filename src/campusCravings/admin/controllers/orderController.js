'use strict';
const orderService = require('../services/order');
const asyncHandler = require('express-async-handler');

exports.getAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getAllOrders(req.body);
    return orders;
});

exports.createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.body);
    return order;
});

exports.updateOrder = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrder(req.params.id, req.body);
    return order;
});

exports.deleteOrder = asyncHandler(async (req, res) => {
    const order = await orderService.deleteOrder(req.params.id);
    return order;
});
