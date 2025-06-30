const mongoose = require('mongoose');

const payoutLogSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    recipient_type: {
        type: String,
        enum: ['restaurant', 'rider'],
        required: true
    },
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['paid', 'failed'],
        required: true,
        default: 'paid'
    },
    stripe_transfer_id: {
        type: String,
        default: ''
    },
    paid_at: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('PayoutLog', payoutLogSchema);
