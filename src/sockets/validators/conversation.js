const Joi = require("joi");

const sendMessageSchema = Joi.object({
    conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    isCustomer: Joi.boolean().required(),
    text: Joi.string().required(),
});

const markMessageReadSchema = Joi.object({
    messageId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    isCustomer: Joi.boolean().required(),
});

module.exports = {
    sendMessageSchema,
    markMessageReadSchema
};
