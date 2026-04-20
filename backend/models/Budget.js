const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'food',
        'transport',
        'shopping',
        'health',
        'entertainment',
        'education',
        'utilities',
        'other',
      ],
      required: [true, 'Category is required'],
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Limit must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

// One budget per category per user

module.exports = mongoose.model('Budget', BudgetSchema);
