const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  price: {
    type: Number,
    default: 0
  },
  description: String,
  estimated_preparation_time: Number,
  customization: {
    type: [
      {
        name: { type: String },
        price: { type: Number }
      }
    ],
    default: []
  },
  sizes: {
    type: [
      {
        name: { type: String, },
        price: { type: Number }
      }
    ],
    default: []
  },
  calories: {
    type: Number,
    min: 0
  },
  out_of_stock: {
    type: Boolean,
    default: false
  },
  image: [String],
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  rating: {
    type: Number,
    min: 0, max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
