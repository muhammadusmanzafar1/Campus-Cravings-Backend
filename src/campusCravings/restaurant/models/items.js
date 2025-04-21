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
  image: [String],
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
