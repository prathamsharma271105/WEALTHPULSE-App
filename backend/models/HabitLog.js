const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  habit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  completed_on: {
    type: String,
    required: true,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to prevent duplicate completions for same habit on same date
habitLogSchema.index({ habit_id: 1, completed_on: 1 }, { unique: true });

habitLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('HabitLog', habitLogSchema);
