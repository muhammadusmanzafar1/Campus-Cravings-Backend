const Joi = require("joi");
const nearbyRestaurantSchema = Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
});
module.exports = {
    nearbyRestaurantSchema
};