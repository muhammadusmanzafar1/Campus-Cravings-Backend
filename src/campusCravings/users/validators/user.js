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

const updateUserSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    fullName: Joi.string().optional(),
    userName: Joi.string().optional(),
    imgUrl: Joi.string().uri().optional(),

    countryCode: Joi.string().optional(),
    ISOCode: Joi.string().optional(),
    phone: Joi.string().optional(),

    status: Joi.string().valid('pending', 'active', 'deleted', 'blocked').optional(),

    isRestaurant: Joi.boolean().optional(),
    isDelivery: Joi.boolean().optional(),
    isCustomer: Joi.boolean().optional(),
    isAdmin: Joi.boolean().optional(),

    isEmailVerified: Joi.boolean().optional(),
    isPhoneVerified: Joi.boolean().optional(),
    isProfileCompleted: Joi.boolean().optional(),

    lastAccess: Joi.date().optional(),

    about: Joi.string().optional(),
    notificationCount: Joi.number().optional(),

    planPro: Joi.boolean().optional(),

    userPlan: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    restaurant: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
}).min(1);
module.exports = {
    addAddressSchema,
    updateAddressSchema,
    updateUserSchema
};
