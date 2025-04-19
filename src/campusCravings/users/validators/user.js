const Joi = require("joi");
const addAddressSchema = Joi.object({
    address: Joi.string().required(),
    coordinates: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    }).required()
});
module.exports = {
    addAddressSchema
};
