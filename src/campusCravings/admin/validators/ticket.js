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
    messages: Joi.array().items(messageSchema),
}).min(2);
const updateTicketSchema = Joi.object({
    subject: Joi.string(),
    description: Joi.string(),
    status: Joi.string().valid("pending", "archive", "resolved"),
    priority: Joi.string().valid("low", "medium", "high"),
    imgUrl: Joi.array().items(Joi.string().uri())
}).min(1);

module.exports = {
    createTicketSchema,
    updateTicketSchema
};
