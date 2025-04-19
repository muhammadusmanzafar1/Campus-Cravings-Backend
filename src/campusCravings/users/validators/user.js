const Joi = require("joi");
const addAddressSchema = Joi.object({
    address: Joi.string().required(),
    coordinates: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    }).required()
});
const updateAddressSchema = Joi.object({
    addressId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    address: Joi.string().optional(),
    coordinates: Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional()
    }).optional()
}).min(2);
module.exports = {
    addAddressSchema,
    updateAddressSchema
};
