const Joi = require("joi");

const getConversationSchema = Joi.object({
    orderId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
        
    isCustomer: Joi.boolean()
        .truthy('true')
        .falsy('false')
        .required()
});

module.exports = {
    getConversationSchema
};
