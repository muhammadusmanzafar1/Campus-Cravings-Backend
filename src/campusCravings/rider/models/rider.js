// models/Rider.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const riderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

riderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Rider', riderSchema);
