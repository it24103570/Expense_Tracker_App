const mongoose = require('mongoose');
//categories
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
BudgetSchema.index({ user: 1, category: 1 }, { unique: true });
module.exports = mongoose.model('Budget', BudgetSchema);
