const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  storeName: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  floor: String,
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  openingHours: {
    monday: { type: String,  },
    tuesday: { type: String, },
    wednesday: { type: String, },
    thursday: { type: String, },
    friday: { type: String, },
    saturday: { type: String, },
    sunday: { type: String, }
  },
  cuisine: {
    type: String, 
    required: true
  },
  deliveryMethods: [{
    type: String, 
    required: true
  }],
  ratings: {
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  paymentMethods: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
  }],
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
