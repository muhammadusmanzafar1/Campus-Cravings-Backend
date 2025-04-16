'use strict';
const orderItemService = require('../services/orderItem');
const asyncHandler = require('express-async-handler');

exports.getAllOrderItems = asyncHandler(async (req, res) => {
    const items = await orderItemService.getAllOrderItems();
    return items;
});

exports.createOrderItem = asyncHandler(async (req, res) => {
    const item = await orderItemService.createOrderItem(req.body);
    return item;
});

exports.updateOrderItem = asyncHandler(async (req, res) => {
    const item = await orderItemService.updateOrderItem(req.params.id, req.body);
    return item;
});

exports.deleteOrderItem = asyncHandler(async (req, res) => {
    const item = await orderItemService.deleteOrderItem(req.params.id);
    return item;
});
