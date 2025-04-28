const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order_note: {
        type: String
    },
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider',
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
    progress: {
        type: [
            {
                _id: false,
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
                    required: true
                },
                updated_at: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: []
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
    addresses: {
        address: { type: String, required: true },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            }
        }
    },
    image_url: {
        type: String,
        default: ''
    },
    order_type: {
        type: String,
        default: ''
    },
    items: {
        type: [
            {
                _id: false,
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
                },
                size: {
                    type: mongoose.Schema.Types.ObjectId,
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