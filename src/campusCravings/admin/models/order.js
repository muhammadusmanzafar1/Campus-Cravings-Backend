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
    rider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: [
            'pending',
            'order_accepted',
            'order_prepared',
            'order_dispatched',
            'delivered',
            'cancelled',
            'completed'
        ],
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
    tip: {
        type: Number,
        default: 0,
        min: 0
    },
    delivery_fee: {
        type: Number,
        default: 0,
        min: 0
    },
    estimated_time: {
        type: String, 
        default: ''
    },
    address: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        default: ''
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