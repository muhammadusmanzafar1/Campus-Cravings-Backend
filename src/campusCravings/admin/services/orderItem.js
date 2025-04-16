'use strict';
const Order = require('../models/orderItem');

const getAllOrders = async () => {
    try {
        const orders = await Order.find()
            // .populate('user_id', 'name email')
            // .populate('restaurant_id', 'name');
        return orders;
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};

const createOrder = async (body) => {
    const { user_id, restaurant_id, status, total_price } = body;
    const newOrder = new Order({
        user_id,
        restaurant_id,
        status,
        total_price
    });
    await newOrder.save();
    return newOrder;
};

const updateOrder = async (id, body) => {
    const updatedOrder = await Order.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
    });

    if (!updatedOrder) {
        throw new Error('Order not found');
    }

    return updatedOrder;
};

const deleteOrder = async (id) => {
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
        throw new Error('Order not found');
    }

    return deletedOrder;
};

module.exports = {
    getAllOrders,
    createOrder,
    updateOrder,
    deleteOrder
};
