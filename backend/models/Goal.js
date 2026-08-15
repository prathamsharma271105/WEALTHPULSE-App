const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  target_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  saved_amount: {
    type: Number,
    default: 0,
    min: 0,
  },
  deadline: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

goalSchema.virtual('progress_percent').get(function () {
  if (!this.target_amount || this.target_amount <= 0) return 0;
  return Math.min(Math.round((this.saved_amount / this.target_amount) * 100), 100);
});

goalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Goal', goalSchema);
