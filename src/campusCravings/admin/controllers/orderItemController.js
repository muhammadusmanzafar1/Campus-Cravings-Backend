'use strict';
const orderItemService = require('../services/orderItem');
const asyncHandler = require('express-async-handler');

exports.getAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderItemService.getAllOrders(req.body);
    return orders;
});

exports.createOrder = asyncHandler(async (req, res) => {
    const order = await orderItemService.createOrder(req.body);
    return order;
});

exports.updateOrder = asyncHandler(async (req, res) => {
    const order = await orderItemService.updateOrder(req.params.id, req.body);
    return order;
});

exports.deleteOrder = asyncHandler(async (req, res) => {
    const order = await orderItemService.deleteOrder(req.params.id);
    return order;
});
