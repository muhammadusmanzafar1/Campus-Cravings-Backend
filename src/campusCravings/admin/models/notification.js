const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  message: {
    type: String,
    required: true, 
  },
  type: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
