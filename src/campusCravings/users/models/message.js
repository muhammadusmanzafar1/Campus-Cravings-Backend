const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel',
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Rider'],
    },
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'read'],
        default: 'sent'
    }


}, { timestamps: true });

const Entity = mongoose.models.Message || mongoose.model('Message', entitySchema);

module.exports = Entity;