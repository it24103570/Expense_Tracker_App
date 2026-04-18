const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route  GET /api/budgets
// @desc   Get all budgets with spending info
// @access Private
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month ? parseInt(month) - 1 : now.getMonth();
    const queryYear = year ? parseInt(year) : now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id });

    const startOfMonth = new Date(queryYear, queryMonth, 1);
    const endOfMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await Transaction.find({
          user: req.user._id,
          category: budget.category,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });
        const spent = transactions.reduce((s, t) => s + t.amount, 0);
        const percentage = Math.round((spent / budget.limit) * 100);

        return {
          _id: budget._id,
          category: budget.category,
          limit: budget.limit,
          spent,
          percentage,
          status: percentage >= 90 ? 'danger' : percentage >= 70 ? 'warning' : 'good',
        };
      })
    );

    res.json({ success: true, data: budgetsWithSpending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/budgets
// @desc   Create or update a budget
// @access Private
router.post(
  '/',
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('limit').isFloat({ min: 1 }).withMessage('Limit must be at least 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { category, limit } = req.body;

    try {
      const budget = await Budget.findOneAndUpdate(
        { user: req.user._id, category },
        { limit },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(201).json({ success: true, data: budget });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @route  DELETE /api/budgets/:id
// @desc   Delete a budget
// @access Private
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    await budget.deleteOne();
    res.json({ success: true, message: 'Budget removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
