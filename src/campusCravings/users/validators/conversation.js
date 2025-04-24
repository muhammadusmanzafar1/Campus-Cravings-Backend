const Joi = require("joi");

const getConversationSchema = Joi.object({
    conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    isCustomer: Joi.boolean().required()
});

module.exports = {
    getConversationSchema
};
