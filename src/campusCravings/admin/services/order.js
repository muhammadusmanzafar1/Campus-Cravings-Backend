'use strict';
const Order = require('../models/order');
const mongoose = require('mongoose');
const axios = require("axios");

const getAllOrders = async () => {
    try {
        // Need to check admin  role or restaurant role when it is implemented
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
    const { user_id, restaurant_id, status, payment_method, items, tip, delivery_fee, address } = body;
    // Need to check restaurant_id when it is implemented
    let total_price = 0;
    for (const item of items) {
        const { item_id, quantity } = item;
        try {
            const URL = `${process.env.URL}:${process.env.PORT}`;
            const response = await axios.get(`${URL}/api/getitem/${item_id}`);
            // if any item is not found, return error
            if (!response.data) {
                return { error: 'Item not found' };
            }
            // calculate total price
            const itemPrice = response.data.itens.price;
            if (typeof itemPrice !== "number") {
                throw new Error(`Invalid price for item ${item_id}`);
            }
            total_price += itemPrice * quantity;
        } catch (err) {
            throw new Error(`Failed to fetch item ${item_id}: ${err.message}`);
        }
    }

    total_price += tip;
    total_price += delivery_fee;
    const newOrder = new Order({
        user_id,
        restaurant_id,
        status,
        total_price,
        payment_method,
        items,
        address
    });

    await newOrder.save();
    return newOrder;
};

const updateOrder = async (id, body) => {
    try {
        // need to test restuarant id: 
        console.log(body);
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
const patchOrder = async (id, body) => {
    try {
        const order = await Order.findById(id);
        if (!order) {
            return ('Order not found');
        }
        const update = { $set: { ...body } };
        if (body.status) {
            const statusIndex = order.progress.findIndex(
                (entry) => entry.status === body.status
            );
            if (statusIndex !== -1) {
                order.progress[statusIndex].updated_at = new Date();
                update.$set.progress = order.progress;
            } else {
                update.$push = {
                    progress: {
                        status: body.status,
                        updated_at: new Date()
                    }
                };
            }
        }
        const updatedOrder = await Order.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true
        });
        return updatedOrder;
    } catch (error) {
        throw new Error('Error updating order: ' + error.message);
    }
};
const getOrder = async (id) => {
    try {
        const order = await Order.findById(id);
        return order;
    } catch (error) {
        throw new Error('Error fetching order: ' + error.message);
    }
};
// Resturant orders 
const getResturantAllOrders = async (req) => {
    try {
        const restaurantId = new mongoose.Types.ObjectId(req.params.restaurantId);
        const orders = await Order.find({ restaurant_id: restaurantId })
        // .populate('user_id', 'name email')  // Populate user details
        // .populate('restaurant_id', 'name')  // Populate restaurant details
        // .populate('items.item_id', 'name price'); // Populate item details (name and price)

        return orders;
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};
// Resturant orders 
const getUserAllOrders = async (req) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId);
        const orders = await Order.find({ user_id: userId })
        // .populate('user_id', 'name email')  // Populate user details
        // .populate('restaurant_id', 'name')  // Populate restaurant details
        // .populate('items.item_id', 'name price'); // Populate item details (name and price)

        return orders;
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};

module.exports = {
    getAllOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    patchOrder,
    getOrder,
    getResturantAllOrders,
    getUserAllOrders
};
