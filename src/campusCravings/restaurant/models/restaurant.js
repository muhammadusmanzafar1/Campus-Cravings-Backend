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
    ref: 'Category',
  }],
});

restaurantSchema.statics.newEntity = async function (body, createdByAdmin = true) {
  const model = {
    storeName: body.storeName,
    brandName: body.brandName,
    phoneNumber: body.phoneNumber,
    address: body.address,
    cuisine: body.cuisine,
    deliveryMethods: body.deliveryMethods,
    paymentMethods: body.paymentMethods,
    floor: body.floor,
    openingHours: body.openingHours,
    categories: body.categories || [],
    userId: body.userId,
  };

  if (createdByAdmin) {
    model.status = 'active';
  } else {
    model.status = 'pending';
  }

  return model;
};

restaurantSchema.statics.isPhoneTaken = async function (phone) {
  return !!(await this.findOne({ phone }));
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
