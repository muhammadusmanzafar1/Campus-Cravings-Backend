'use strict';
const Order = require('../models/order');
const itemsDB = require('../../restaurant/models/items')
const mongoose = require('mongoose');
const APIError = require('../../../../utils/ApiError');
const httpStatus = require('http-status');
const { getIO } = require('../../../sockets/service/socketService');
const { sendOrderToRestaurant } = require('../../../sockets/controllers/restaurant');

const getAllOrders = async (req) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;
        const regex = new RegExp(search, 'i');

        const pipeline = [
            // Lookup user
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },

            // Lookup restaurant
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant_id',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: '$restaurant' },

            // Flatten items
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'items',
                    localField: 'items.item_id',
                    foreignField: '_id',
                    as: 'itemDetails'
                }
            },
            {
                $unwind: {
                    path: '$itemDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    order: { $first: '$$ROOT' },
                    items: {
                        $push: {
                            item_id: '$items.item_id',
                            quantity: '$items.quantity',
                            customizations: '$items.customizations',
                            name: '$itemDetails.name',
                            price: '$itemDetails.price'
                        }
                    }
                }
            },
            {
                $addFields: {
                    'order.items': '$items'
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$order'
                }
            },

            // Search filter
            ...(search ? [{
                $match: {
                    $or: [
                        { 'user.fullName': regex },
                        { 'restaurant.storeName': regex }
                    ]
                }
            }] : []),

            // Projection to only return selected fields
            {
                $project: {
                    user_id: {
                        _id: '$user._id',
                        fullName: '$user.fullName',
                        email: '$user.email'
                    },
                    restaurant_id: {
                        _id: '$restaurant._id',
                        storeName: '$restaurant.storeName',
                        brandName: '$restaurant.brandName',
                        phoneNumber: '$restaurant.phoneNumber'
                    },
                    items: 1,
                    status: 1,
                    total_price: 1,
                    payment_method: 1,
                    tip: 1,
                    delivery_fee: 1,
                    estimated_time: 1,
                    addresses: 1,
                    image_url: 1,
                    order_type: 1,
                    progress: 1,
                    created_at: 1,
                    updated_at: 1,
                    assigned_to: 1
                }
            },

            { $skip: skip },
            { $limit: Number(limit) }
        ];

        const orders = await Order.aggregate(pipeline);

        // Total count for pagination (without skip/limit)
        const countPipeline = pipeline.filter(stage => !('$skip' in stage || '$limit' in stage));
        countPipeline.push({ $count: 'total' });
        const countResult = await Order.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        return {
            data: orders,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new APIError(`Error fetching orders: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
};


const createOrder = async (req) => {
    try {
        const { payment_method, items, tip, delivery_fee, addresses, order_note, order_type } = req.body;

        const user_id = req.user._id;
        let order_price = 0;
        let restaurant_id = null;
        for (const item of items) {
            const { item_id, quantity } = item;
            const response = await itemsDB.findById(item_id);
            if (!response) {
                throw new APIError('Item not found', httpStatus.status.NOT_FOUND);
            }
            if (!restaurant_id) {
                restaurant_id = response.restaurant?.toString();
            } else if (response.restaurant?.toString() !== restaurant_id) {
                throw new APIError('All items must be from the same restaurant', httpStatus.status.BAD_REQUEST);
            }
            let customizedItemPrice = 0;
            const itemCustomizations = item.customizations || [];
            for (const customizationId of itemCustomizations) {
                const matchedCustomization = response.customization.find(
                    (c) => c._id?.toString() === customizationId?.toString()
                );
                if (matchedCustomization) {
                    customizedItemPrice += matchedCustomization.price;
                }
            }
            // add on of size
            const addSizePrice = response.sizes.find((s) => s._id?.toString() === item.size?.toString());
            if (addSizePrice) {
                order_price += (response.price + customizedItemPrice + addSizePrice.price) * quantity;
            } else {
                order_price += (response.price + customizedItemPrice) * quantity;
            }
        }
        let total_price = order_price * 1.1;
        total_price += tip;
        total_price += delivery_fee;
        let newOrder = new Order({
            user_id,
            restaurant_id,
            tip,
            delivery_fee,
            total_price: parseFloat(total_price).toFixed(2),
            order_price,
            payment_method,
            items,
            addresses,
            order_type,
            order_note
        });
        await newOrder.save();
        newOrder = await patchOrder(newOrder._id, { status: 'pending' });

        //Socket here to send order to restaurant in real-time
        console.log(restaurant_id);
        await sendOrderToRestaurant(restaurant_id, newOrder);
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
        let updatedOrder = await Order.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true
        })
            .populate({
                path: 'user_id',
                select: 'firstName lastName imgUrl phoneNumber'
            })
            .populate({
                path: 'restaurant_id',
                select: 'storeName brandName phoneNumber'
            })
            .populate({
                path: 'items.item_id',
                select: 'name price customization sizes'
            });
        updatedOrder.items = updatedOrder.items.map((orderItem) => {
            const { item_id, customizations, size } = orderItem;
            if (!item_id) return orderItem;
            const selectedCustomizations = item_id.customization?.filter((cust) =>
                customizations?.some(
                    (selectedId) => selectedId.toString() === cust._id.toString()
                )
            );
            const selectedSize = item_id.sizes?.find(
                (s) => s._id.toString() === size?.toString()
            );
            return {
                ...orderItem.toObject(),
                item_id: {
                    ...item_id.toObject(),
                    customization: selectedCustomizations,
                    sizes: selectedSize ? [selectedSize] : []
                }
            };
        });
        const io = getIO();
        io.to(`order-${order._id}`).emit('order-status-updated', {
            orderId: order._id,
            status: body.status,
            progress: updatedOrder.progress,
            estimated_time: updatedOrder.estimated_time
        });

        return updatedOrder;
    } catch (error) {
        throw new APIError(
            `Error updating order: ${error.message}`,
            error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR
        );
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
        const restaurantId = mongoose.Types.ObjectId.createFromHexString(req.params.restaurantId);
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
