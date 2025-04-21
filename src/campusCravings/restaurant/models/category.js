const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
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
