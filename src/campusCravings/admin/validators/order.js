const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const coordinatesSchema = Joi.object({
    type: Joi.string().valid('Point').default('Point').required(),
    coordinates: Joi.array()
        .items(Joi.number().required())
        .length(2)
        .required()
});

const addressesSchema = Joi.object({
    address: Joi.string().required(),
    coordinates: coordinatesSchema.required()
});
const statusEnum = [
    'pending',
    'order_accepted',
    'order_prepared',
    'order_dispatched',
    'delivered',
    'cancelled',
    'completed'
];
const orderItemSchema = Joi.object({
    item_id: objectId.required(),
    quantity: Joi.number().min(1).required(),
    customizations: Joi.array().items(Joi.string()).default([]),
    size: objectId.optional()
    
});
const progressSchema = Joi.array().items(
    Joi.object({
        status: Joi.string().valid(...statusEnum).required(),
        updated_at: Joi.date().default(() => new Date())
    })
).default([]);
const createOrderSchema = Joi.object({
    progress: progressSchema,
    payment_method: Joi.string().valid('cash', 'card', 'wallet', 'upi').required(),
    tip: Joi.number().min(0).default(0),
    delivery_fee: Joi.number().min(0).default(0),
    estimated_time: Joi.string().allow('').default(''),
    order_type: Joi.string().default('').valid('delivery', 'pickup').required(),
    addresses: addressesSchema.required(),
    image_url: Joi.string().allow('').default(''),
    items: Joi.array().items(orderItemSchema).default([]),
    order_note : Joi.string().allow(''),
});
const updateOrderSchema = Joi.object({
    assigned_to: Joi.alternatives().try(objectId, Joi.valid(null)),
    status: Joi.string().valid(...statusEnum),
    progress: progressSchema,
    total_price: Joi.number(),
    payment_method: Joi.string().valid('cash', 'card', 'wallet', 'upi'),
    tip: Joi.number().min(0),
    delivery_fee: Joi.number().min(0),
    estimated_time: Joi.string().allow(''),
    order_type: Joi.string().allow(''),
    addresses: addressesSchema.allow(''),
    image_url: Joi.string().allow(''),
    order_note : Joi.string().allow(''),
}).min(1);
module.exports = {
    createOrderSchema,
    updateOrderSchema,
};