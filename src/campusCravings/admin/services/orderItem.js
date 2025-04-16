'use strict';
const OrderItem = require('../models/orderItem');

const getAllOrderItems = async () => {
    const items = await OrderItem.find()
    // .populate('order_id menu_item_id');
    return items;
};

const createOrderItem = async (body) => {
    const newItem = new OrderItem(body);
    await newItem.save();
    return newItem;
};

const updateOrderItem = async (id, body) => {
    const updated = await OrderItem.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) throw new Error("OrderItem not found");
    return updated;
};

const deleteOrderItem = async (id) => {
    const deleted = await OrderItem.findByIdAndDelete(id);
    if (!deleted) throw new Error("OrderItem not found");
    return deleted;
};

module.exports = {
    getAllOrderItems,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
};
