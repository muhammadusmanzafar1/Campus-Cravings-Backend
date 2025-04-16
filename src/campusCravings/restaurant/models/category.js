const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be greater than or equal to 0'],
  },
  description: {
    type: String,
    required: true,
  },
  estimated_preparation_time: {
    type: Number, 
    required: true,
    min: [1, 'Preparation time must be at least 1 minute'],
  },
  customization: {
    type: [String],
    default: [],
  },
  image: [
    {
      type: String,
      required: true,
    }
  ]
});

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true, 
  },
  description: {
    type: String,
    required: true,
  },
  items: {
    type: [itemSchema],
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
  }
});

module.exports = mongoose.model('Category', categorySchema);
