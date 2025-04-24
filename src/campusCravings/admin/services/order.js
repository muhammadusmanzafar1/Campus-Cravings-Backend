'use strict';
const Order = require('../models/order');
const itemsDB = require('../../restaurant/models/items')
const mongoose = require('mongoose');
const APIError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');

const getAllOrders = async () => {
    try {
        const orders = await Order.find()
            .populate('user_id', 'firstName lastName email')
            .populate('restaurant_id', 'storeName brandName phoneNumber')
            .populate('items.item_id', 'name price');
        return orders;
    } catch (error) {
        throw new APIError(`Error fetching orders: ${error.message}`, httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
const createOrder = async (req) => {
    try {
        const { payment_method, items, tip, delivery_fee, addresses, order_type, customizations = [] } = req.body;
        const user_id = req.user._id;
        let total_price = 0;
        let restaurant_id = null;
        for (const item of items) {
            const { item_id, quantity } = item;
            const response = await itemsDB.findById(item_id);
            if (!response) {
                throw new APIError('Item not found', httpStatus.status.NOT_FOUND);
            }
            if (!restaurant_id) {
                restaurant_id = response.restaurant.toString();
            } else if (response.restaurant.toString() !== restaurant_id) {
                throw new APIError('All items must be from the same restaurant', httpStatus.status.BAD_REQUEST);
            }
            let customizedItemPrice = 0;
            const itemCustomizations = item.customizations || [];
            for (const customizationId of itemCustomizations) {
                const matchedCustomization = response.customization.find(
                    (c) => c._id.toString() === customizationId.toString()
                );
                if (matchedCustomization) {
                    customizedItemPrice += matchedCustomization.price;
                }
            }
            // add on of size

            // console.log("Response Size",response);
            const addSizePrice = response.sizes.find((s) => s._id.toString() === item.size.toString());
            if (addSizePrice) {
                total_price += (response.price + customizedItemPrice + addSizePrice.price) * quantity;
            } else {
                total_price += (response.price + customizedItemPrice) * quantity;
            }
        }
        total_price += tip;
        total_price += delivery_fee;
        let newOrder = new Order({
            user_id,
            restaurant_id,
            tip,
            delivery_fee,
            customizations,
            total_price,
            payment_method,
            items,
            addresses,
            order_type
        });
        await newOrder.save();
        newOrder = await patchOrder(newOrder._id, { status: 'pending' });
        return newOrder;

    } catch (err) {
        throw new APIError(`Error creating order: ${err.message}`, err.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
const deleteOrder = async (id) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            throw new APIError('Order not found', httpStatus.status.NOT_FOUND);
        }

        return deletedOrder;
    } catch (error) {
        throw new APIError(`Error deleting order: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
const patchOrder = async (id, body) => {
    try {
        const order = await Order.findById(id);
        if (!order) {
            throw new APIError('Order not found', httpStatus.status.NOT_FOUND);
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
        throw new APIError(`Error updating order: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
const getOrder = async (id) => {
    try {
        const order = await Order.findById(id).populate('user_id', 'firstName lastName fullName imgUrl phoneNumber email').populate('items.item_id', 'name price image');
        return order;
    } catch (error) {
        throw new APIError(`Error fetching order: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};
// Resturant orders 
const getResturantAllOrders = async (req) => {
    try {
        const restaurantId = new mongoose.Types.ObjectId(req.params.restaurantId);
        const orders = await Order.find({ restaurant_id: restaurantId })
            .populate('user_id', 'firstName lastName email')
            .populate('restaurant_id', 'storeName brandName phoneNumber')
            .populate('items.item_id', 'name price');
        return orders;
    } catch (error) {
        throw new APIError(`Error fetching orders: ${error.message}`, error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};


module.exports = {
    getAllOrders,
    createOrder,
    deleteOrder,
    patchOrder,
    getOrder,
    getResturantAllOrders

};
