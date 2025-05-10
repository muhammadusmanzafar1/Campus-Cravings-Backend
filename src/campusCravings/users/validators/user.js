const Joi = require("joi");
const addAddressSchema = Joi.object({
    address: Joi.string().required(),
    coordinates: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required()
});
const updateAddressSchema = Joi.object({
    addressId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    address: Joi.string().required(),
    coordinates: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required()
}).min(3);

const updateUserAdmin = {
    body: Joi.object().keys({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        fullName: Joi.string(),
        email: Joi.string().optional().email().lowercase(),
        deviceId: Joi.string().optional(),
        googleId: Joi.string().optional(),
        facebookId: Joi.string().optional(),
        appleId: Joi.string().optional(),
        universityName: Joi.string().optional(),
        imgUrl: Joi.string().allow(""),
        status: Joi.string(),
        deviceType: Joi.string().optional().valid('web', 'android', 'ios'),
        role: Joi.string().default("user"),
        countryCode: Joi.string().optional(),
        phoneNumber: Joi.string().optional(),
        phone: Joi.string().optional(),
        isRestaurant: Joi.boolean().optional(),
        isCustomer: Joi.boolean().optional(),
        isDelivery: Joi.boolean().optional(),
        isAdmin: Joi.boolean().optional(),
        storeName: Joi.string().when('isRestaurant', { is: true, then: Joi.required() }),
        brandName: Joi.string().when('isRestaurant', { is: true, then: Joi.required() }),
        floor: Joi.string().when('isRestaurant', { is: true, then: Joi.required() }),
        addresses: Joi.array()
            .items(
                Joi.object({
                    address: Joi.string().required(),
                    coordinates: Joi.object({
                        type: Joi.string().valid('Point').required(),
                        coordinates: Joi.array()
                            .items(Joi.number().required())
                            .length(2)
                            .required()
                    }).required()
                })
            )
            .when('isRestaurant', { is: true, then: Joi.required() }),
        openingHours: Joi.object({
            monday: Joi.string().optional(),
            tuesday: Joi.string().optional(),
            wednesday: Joi.string().optional(),
            thursday: Joi.string().optional(),
            friday: Joi.string().optional(),
            saturday: Joi.string().optional(),
            sunday: Joi.string().optional(),
        }),
        cuisine: Joi.string().when('isRestaurant', { is: true, then: Joi.required() }),
        deliveryMethods: Joi.array().items(Joi.string()).when('isRestaurant', { is: true, then: Joi.required() }),
        ratings: Joi.object({
            averageRating: Joi.number().default(0),
            totalRatings: Joi.number().default(0),
        }).when('isRestaurant', { is: true, then: Joi.required() }),
        paymentMethods: Joi.array().items(Joi.string()).when('isRestaurant', { is: true, then: Joi.required() }),
    })
};

const updateUserSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    userName: Joi.string().optional(),
    imgUrl: Joi.string().allow(""),

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
    updateUserSchema,
    updateUserAdmin
};
