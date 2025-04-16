const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    menu_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    customizations: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
