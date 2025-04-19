const crypto = require('../../../utils/crypto');
const utils = require('../../../utils/utils');
const mongoose = require("mongoose");

const authMethods = ['email', 'google', 'facebook', 'apple', 'github', 'phone'];
const addressSchema = new mongoose.Schema({
    address: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }
}, { _id: true });

const entitySchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    fullName: String,
    userName: String,
    imgUrl: String,
    authMethod: {
        type: String,
        enum: authMethods,
        default: 'email',
    },
    countryCode: String,
    ISOCode: String,
    phone: String,
    email: {
        type: String,
        lowercase: true,
    },
    activationCode: String,
    password: String,
    addresses: {
        type: [addressSchema],
        validate: [val => val.length <= 5, 'Cannot add more than 5 addresses']
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'deleted', 'blocked'],
        default: 'pending',
    },
    isRestaurant: {
        type: Boolean,
        default: false
    },
    isDelivery: {
        type: Boolean,
        default: false
    },
    isCustomer: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    isProfileCompleted: {
        type: Boolean,
        default: false,
    },
    lastAccess: {
        type: Date,
        default: null,
    },
    about: String,
    notificationCount: {
        type: Number,
        default: 0,
    },
    googleId: String,
    facebookId: String,
    appleId: String,
    userPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userPlan",
    },
    googlePurchase: {
        packageName: String,
        subscriptionId: String,
        purchaseToken: String,
        transactionId: String,
    },
    applePurchase: {
        transactionId: String,
        Receipt: String,
        subscriptionId: String,
        expiryDate: String,
    },
    planPro: {
        type: Boolean,
        default: false,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
    }
});

entitySchema.statics.newEntity = async function (body, createdByAdmin = true) {
    const model = {
        firstName: body.firstName,
        lastName: body.lastName,
        fullName: body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : null,
        authMethod: body.authMethod,
        userName: body.firstName ? `${body.firstName}_${utils.generateRandomAlphaNumeric()}` : utils.generateRandomAlphaNumeric(),
        email: body.email,
        phone: body.phone,
        ISOCode: body.ISOCode,
        countryCode: body.countryCode,
        isRestaurant: body.isRestaurant,
        isDelivery: body.isDelivery,
        isCustomer: body.isCustomer,
        isAdmin: body.isAdmin,
        about: body.about,
        googleId: body.googleId,
        facebookId: body.facebookId,
        appleId: body.appleId,
        restaurantId: body.restaurant,
        stripeCustomerId: body.stripeCustomerId || "",
        addresses: body.addresses || []
    };

    if (body.password) {
        model.password = await crypto.setPassword(body.password);
    }

    if (createdByAdmin) {
        model.isEmailVerified = body.authMethod === 'email';
        model.isPhoneVerified = body.authMethod === 'phone';
        model.status = 'active';
    } else {
        model.activationCode = utils.randomPin();
    }

    return model;
};

entitySchema.statics.isEmailTaken = async function (email) {
    return !!(await this.findOne({ email }));
};

entitySchema.statics.isPhoneTaken = async function (phone) {
    return !!(await this.findOne({ phone }));
};

entitySchema.statics.isPasswordMatch = async function (user, password) {
    return await crypto.comparePassword(password, user.password);
};

const Entity = mongoose.models.User || mongoose.model('User', entitySchema);

module.exports = Entity;