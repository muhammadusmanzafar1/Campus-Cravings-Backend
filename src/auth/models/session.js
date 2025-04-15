const mongoose = require("mongoose");

// Define the schema
const entitySchema = new mongoose.Schema({
    accessToken: {
        type: String,
        required: true, // Make it required if necessary
    },
    refreshToken: {
        type: String,
        required: true, // Make it required if necessary
    },
    fcmToken: {
        type: String,
        required: true, // Make it required if necessary
    },
    tokenType: {
        type: String,
        enum: ['google', 'facebook', 'linkedin', 'twitter'],
        default: null,
    },
    deviceType: {
        type: String,
        enum: ['web', 'ios', 'android'],
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true, // Make sure the user is required if appropriate
    },
    status: {
        type: String,
        enum: ["active", "expired"],
        default: "active",
    },
    accessTokenExpires: {
        type: Date,
        default: null,
    },
    refreshTokenExpires: {
        type: Date,
        default: null,
    },
});

// Create and export the model
const Entity = mongoose.model("Sessions", entitySchema);

module.exports = Entity;
