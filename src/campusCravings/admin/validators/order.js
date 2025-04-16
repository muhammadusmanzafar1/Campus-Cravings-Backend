const Joi = require("joi");

const orderItemSchema = Joi.object({
    item_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    quantity: Joi.number().min(1).required(),
    customizations: Joi.array().items(Joi.string()).default([]),
});

const createOrderSchema = Joi.object({
    user_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    status: Joi.string().valid('pending', 'completed', 'cancelled'),
    payment_method: Joi.string().valid('cash', 'card', 'wallet', 'upi').required(),
    items: Joi.array().items(orderItemSchema).default([]),
});

const updateOrderSchema = Joi.object({
    user_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    restaurant_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    status: Joi.string().valid('pending', 'completed', 'cancelled'),
    total_price: Joi.number(),
    payment_method: Joi.string().valid('cash', 'card', 'wallet', 'upi'),
    items: Joi.array().items(orderItemSchema),
}).min(1);

module.exports = {
    createOrderSchema,
    updateOrderSchema,
};
