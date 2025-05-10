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
const updateRestaurantSchema = Joi.object({
    storeName: Joi.string(),
    restaurantImages: Joi.array().items(Joi.string()),
    openingHours: Joi.object({
        monday: Joi.string(),
        tuesday: Joi.string(),
        wednesday: Joi.string(),
        thursday: Joi.string(),
        friday: Joi.string(),
        saturday: Joi.string(),
        sunday: Joi.string(),
    }),
    brandName: Joi.string(),
    floor: Joi.string(),
    phoneNumber: Joi.string(),
    addresses: Joi.object({
        address: Joi.string(),
        coordinates: Joi.object({
            type: Joi.string().valid('Point'),
            coordinates: Joi.array().items(
                Joi.number()
            ).length(2),
        })
    }),
    cuisine: Joi.string(),
    deliveryMethods: Joi.array().items(Joi.string()),
    paymentMethods: Joi.array().items(Joi.string()),
    status: Joi.string(),
    categories: Joi.array().items(Joi.string())
});

module.exports = {
    nearbyRestaurantSchema,
    searchSchema,
    updateRestaurantSchema
};