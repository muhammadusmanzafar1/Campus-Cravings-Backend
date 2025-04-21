const { keep } = require("googleapis/build/src/apis/keep");
const Joi = require("joi");
const nearbyRestaurantSchema = Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
});
const searchSchema = Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    search: Joi.string().required(),
});
module.exports = {
    nearbyRestaurantSchema,
    searchSchema
};