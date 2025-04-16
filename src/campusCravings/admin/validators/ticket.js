const Joi = require("joi");
const messageSchema = Joi.object({
    sender: Joi.string().required(),
    text: Joi.string().allow(''),
    imageUrl: Joi.string().uri().allow(''),
    time: Joi.date(),
});
const updateTicketSchema = Joi.object({
    subject: Joi.string(),
    description: Joi.string(),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    status: Joi.string().valid("pending", "archive", "resolved"),
    priority: Joi.string().valid("low", "medium", "high"),
    imgUrl: Joi.array().items(Joi.string().uri()),
    messages: Joi.array().items(messageSchema),
}).min(1);


module.exports = {
    updateTicketSchema,
};
