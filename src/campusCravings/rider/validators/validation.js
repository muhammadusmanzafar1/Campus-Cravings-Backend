const Joi = require('joi');

const registerRiderSchema = {
    body: Joi.object({
        vehicleType: Joi.string().valid('bike', 'car', 'scooter').required(),
        vehicleNumber: Joi.string().required(),
        licenseNumber: Joi.string().required(),
        location: Joi.object({
            lat: Joi.number().required(),
            lng: Joi.number().required()
        }).required()
    })
}

module.exports = {
    registerRiderSchema
};
