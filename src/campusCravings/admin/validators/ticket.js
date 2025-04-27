const Joi = require("joi");
const messageSchema = Joi.object({
    sender: Joi.string().required(),
    text: Joi.string().allow(''),
    imageUrl: Joi.string().uri().allow(''),
    time: Joi.date(),
});
const createTicketSchema = Joi.object({
    subject: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().valid("pending", "archive", "resolved"),
    priority: Joi.string().valid("low", "medium", "high"),
    imgUrl: Joi.array().items(Joi.string().uri()),
}).min(2);
const updateTicketSchema = Joi.object({
    subject: Joi.string(),
    description: Joi.string(),
    status: Joi.string().valid("pending", "archive", "resolved"),
    priority: Joi.string().valid("low", "medium", "high"),
    imgUrl: Joi.array().items(Joi.string().uri()),
    read: Joi.boolean(),
}).min(1);
const replyTicketSchema = Joi.object({
    text: Joi.string().allow('').optional(),
    imageUrl: Joi.array().items(Joi.string().uri()).optional()
}).custom((value, helpers) => {
    if (!value.text && (!value.imageUrl || value.imageUrl.length === 0)) {
        return helpers.error("any.invalid");
    }
    return value;
}).messages({
    "any.invalid": "Message must contain either text or image."
});
module.exports = {
    createTicketSchema,
    updateTicketSchema,
    replyTicketSchema
};
