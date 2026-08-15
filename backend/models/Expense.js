const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  note: {
    type: String,
    default: '',
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

expenseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Expense', expenseSchema);
