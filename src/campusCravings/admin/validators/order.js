const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const orderItemSchema = Joi.object({
    item_id: objectId.required(),
    quantity: Joi.number().min(1).required(),
    customizations: Joi.array().items(Joi.string()).default([])
});
const createOrderSchema = Joi.object({
    user_id: objectId.required(),
    restaurant_id: objectId.required(),
    rider_id: objectId.allow(null).custom((value, helpers) => {
        if (value !== null && !/^[0-9a-fA-F]{24}$/.test(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }).default(null),
    status: Joi.string().valid(
        'pending',
        'order_accepted',
        'order_prepared',
        'order_dispatched',
        'delivered',
        'cancelled',
        'completed'
    ).default('pending'),
    total_price: Joi.number().required(),
    payment_method: Joi.string().valid('cash', 'card', 'wallet', 'upi').required(),
    tip: Joi.number().min(0).default(0),
    delivery_fee: Joi.number().min(0).default(0),
    estimated_time: Joi.string().allow('').default(''),
    order_type: Joi.string().allow('').default(''),
    address: Joi.string().required(),
    image_url: Joi.string().uri().allow('').default(''),
    items: Joi.array().items(orderItemSchema).default([])
});
const updateOrderSchema = Joi.object({
    user_id: objectId,
    restaurant_id: objectId,
    rider_id: Joi.alternatives().try(objectId, Joi.allow(null)),
    status: Joi.string().valid(
        'pending',
        'order_accepted',
        'order_prepared',
        'order_dispatched',
        'delivered',
        'cancelled',
        'completed'
    ),
    total_price: Joi.number(),
    payment_method: Joi.string().valid('cash', 'card', 'wallet', 'upi'),
    tip: Joi.number().min(0),
    delivery_fee: Joi.number().min(0),
    estimated_time: Joi.string().allow(''),
    order_type: Joi.string().allow(''),
    address: Joi.string(),
    image_url: Joi.string().uri().allow(''),
    items: Joi.array().items(orderItemSchema)
}).min(1);
module.exports = {
    createOrderSchema,
    updateOrderSchema,
};