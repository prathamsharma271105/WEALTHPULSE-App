const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  asset_name: {
    type: String,
    required: true,
    trim: true,
  },
  asset_type: {
    type: String,
    required: true,
    trim: true,
  },
  amount_invested: {
    type: Number,
    required: true,
    min: 0,
  },
  current_value: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

investmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Investment', investmentSchema);
