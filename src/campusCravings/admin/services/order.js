'use strict';
const Order = require('../models/order');

const getAllOrders = async () => {
    try {
        const orders = await Order.find()
            // .populate('user_id', 'name email')  // Populate user details
            // .populate('restaurant_id', 'name')  // Populate restaurant details
            // .populate('items.item_id', 'name price'); // Populate item details (name and price)

        return orders;
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};


const createOrder = async (body) => {
    const { user_id, restaurant_id, status, total_price, payment_method, items } = body;
    const newOrder = new Order({
        user_id,
        restaurant_id,
        status,
        total_price,
        payment_method,
        items
    });
    await newOrder.save();
    return newOrder;
};

const updateOrder = async (id, body) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!updatedOrder) {
            throw new Error('Order not found');
        }

        return updatedOrder;
    } catch (error) {
        throw new Error('Error updating order: ' + error.message);
    }
};
const deleteOrder = async (id) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            throw new Error('Order not found');
        }

        return deletedOrder;
    } catch (error) {
        throw new Error('Error deleting order: ' + error.message);
    }
};


module.exports = {
    getAllOrders,
    createOrder,
    updateOrder,
    deleteOrder
};
