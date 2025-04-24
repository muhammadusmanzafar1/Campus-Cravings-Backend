const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  storeName: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  floor: String,
  phoneNumber: {
    type: String,
    required: true,
    unique: true
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
  cuisine: {
    type: String,
    required: true
  },
  deliveryMethods: [{
    type: String,
    required: true
  }],
  view_count: {
    type: Number,
    default: 0
  },
  views: [{
    date: { type: Date, required: true },
    views: { type: Number, required: true, default: 1 }
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
    ref: 'Category',
  }],
});

restaurantSchema.index({ "addresses.coordinates": "2dsphere" });

restaurantSchema.statics.newEntity = async function (body, createdByAdmin = true) {
  const model = {
    storeName: body.storeName,
    brandName: body.brandName,
    phoneNumber: body.phoneNumber,
    addresses: body.addresses[0],
    cuisine: body.cuisine,
    deliveryMethods: body.deliveryMethods,
    paymentMethods: body.paymentMethods,
    floor: body.floor,
    openingHours: body.openingHours,
    categories: body.categories || [],
    userId: body.userId,
  };

  model.status = createdByAdmin ? 'active' : 'pending';

  return model;
};

restaurantSchema.statics.isPhoneTaken = async function (phone) {
  return !!(await this.findOne({ phone }));
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
