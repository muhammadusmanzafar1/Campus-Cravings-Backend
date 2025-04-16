const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    total_price: {
        type: Number,
        required: true
    },
    payment_method: {
        type: String,
        enum: ['cash', 'card', 'wallet', 'upi'],
        required: true
    },
    items: {
        type: [
            {
                item_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Item',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                customizations: {
                    type: [String], 
                    default: []
                }
            }
        ],
        default: []
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = mongoose.model('Order', orderSchema);
