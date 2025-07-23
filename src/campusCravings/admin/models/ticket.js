const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: [String],
        default: []
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const ticketSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'archive', "resolved"],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    imgUrl: {
        type: [String],
        default: []
    },
    messages: {
        type: [messageSchema],
        default: []
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);