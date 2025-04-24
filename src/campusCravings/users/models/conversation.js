const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider",
        required: true,
    },

}, { timestamps: true });

const Entity = mongoose.models.Conversation || mongoose.model('Conversation', entitySchema);

module.exports = Entity;