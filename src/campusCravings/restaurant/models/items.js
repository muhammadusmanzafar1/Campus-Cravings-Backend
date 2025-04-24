const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  estimated_preparation_time: Number,
  customization: [
    {
      name: String,
      price: Number
    }
  ],
  sizes: [
    {
      name: String,
      price: Number
    }
  ],
  calories: {
    type: Number,
    min: 0
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
