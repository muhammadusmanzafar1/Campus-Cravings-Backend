const Joi = require('joi');

const { password, phone } = require('../../../validators/common.validation');

const registerViaEmail = {
    body: Joi.object().keys({
        authMethod: Joi.string().required().valid('email', 'google', 'facebook', 'apple', 'github', 'phone'),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        fullName: Joi.string(),
        email: Joi.string().optional().email().lowercase(),
        password: Joi.string().required().custom(password),
        deviceId: Joi.string().optional(),
        googleId: Joi.string().optional(),
        facebookId: Joi.string().optional(),
        appleId: Joi.string().optional(),
        imgUrl: Joi.string(),
        status: Joi.string(),
        deviceType: Joi.string().optional().valid('web', 'android', 'ios'),
        role: Joi.string().default("user"),
        countryCode: Joi.string().optional(),
        phone: Joi.string().optional().custom(phone)
    }).xor("email","phone")
};

const registerViaPhone = {
    body: Joi.object().keys({
        authMethod: Joi.string().required().valid('phone'),
        countryCode: Joi.string().required(),
        password: Joi.string().custom(password),
        ISOCode: Joi.string(),
        phone: Joi.string().required().custom(phone),
        deviceId: Joi.string().required(),
        deviceType: Joi.string().required().valid('web', 'android', 'ios')
    })
};

const validateVerifyOTP = {
    body: Joi.object().keys({
        userId: Joi.string().required(),
        activationCode: Joi.string().required(),
        deviceId: Joi.string().required(),
        deviceType: Joi.string().required().valid('web', 'android', 'ios')
    })
};

const loginVerify = {
    body: Joi.object().keys({
        username: Joi.string(),
        email: Joi.string().email().lowercase(),
        password: Joi.string().custom(password),
        authMethod: Joi.string().optional().valid('phone', 'email'),
        verificationType: Joi.string().optional().valid('password', 'otp'),
        deviceId: Joi.string().optional(),
        deviceType: Joi.string().optional().valid('web', 'android', 'ios')
    }).xor('username', 'email').required()
};

const resendOtp = {
    body: Joi.object().keys({
        userId: Joi.string().required(),
        authMethod: Joi.string().required().valid('phone', 'email'),
        deviceId: Joi.string().required(),
        deviceType: Joi.string().required().valid('web', 'android', 'ios')
    })
};

const forgotPassword = {
    body: Joi.object().keys({
        authMethod: Joi.string().required().valid('phone', 'email'),
        email: Joi.string().email().lowercase(),
        phone: Joi.string().custom(phone),
        deviceId: Joi.string().required(),
        deviceType: Joi.string().required().valid('web', 'android', 'ios')
    }).or('phone', 'email').required()
};

const updatePassword = {
    body: Joi.object().keys({
        password: Joi.string().required().custom(password),
        newPassword: Joi.string().required().custom(password)
    })
};

const resetPassword = {
    body: Joi.object().keys({
        password: Joi.string().required().custom(password),
    })
};

const socialLogin = {
    body: Joi.object().keys({
        authMethod: Joi.string().required().valid('email', 'google', 'facebook', 'apple'),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        fullName: Joi.string().optional(),
        email: Joi.string(),
        deviceId: Joi.string().optional(),
        googleId: Joi.string().optional(),
        facebookId: Joi.string().optional(),
        appleId: Joi.string().optional(),
        imgUrl: Joi.string(),
        status: Joi.string(),
        deviceType: Joi.string().optional().valid('web', 'android', 'ios'),
        role: Joi.string().default("user")
    })
};
module.exports = {
    registerViaEmail,
    registerViaPhone,
    validateVerifyOTP,
    loginVerify,
    resendOtp,
    forgotPassword,
    updatePassword,
    resetPassword,
    socialLogin
};