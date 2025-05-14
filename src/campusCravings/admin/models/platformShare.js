const mongoose = require('mongoose');

const platformShareSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true }, // in cents
  currency: { type: String, default: 'usd' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlatformShare', platformShareSchema);