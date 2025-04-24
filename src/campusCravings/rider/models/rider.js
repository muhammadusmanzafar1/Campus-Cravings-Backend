// models/Rider.js
const { required } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const riderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  batch_year: {
    type: String,
    required: true
  },
  order_accepted: {
    type: Boolean,
    default: false
  },
  majors: {
    type: [String],
    required: true
  },
  monirs: {
    type: [String],
  },
  club_organizations: {
    type: [String],
  },
  bio: {
    type: String,
  },
  SSN: {
    type: String,
    required: true
  },
  national_id_image_url: {
    type: String,
    required: true
  },
  totalHours: {
    type: Number,
    default: 0
  },
  totalDistance: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  rating: {
    average: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  deliveriesCompleted: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'banned'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

riderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Rider', riderSchema);
