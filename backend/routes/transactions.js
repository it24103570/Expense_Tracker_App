const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route  GET /api/transactions
// @desc   Get all transactions for the current user
// @access Private
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, month, year, limit = 50 } = req.query;
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    
    if (month || year) {
      const now = new Date();
      const queryMonth = month ? parseInt(month) - 1 : now.getMonth();
      const queryYear = year ? parseInt(year) : now.getFullYear();
      const start = new Date(queryYear, queryMonth, 1);
      const end = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/transactions
// @desc   Create a transaction
// @access Private
router.post(
  '/',
  [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const transaction = await Transaction.create({
        ...req.body,
        user: req.user._id,
      });
      res.status(201).json({ success: true, data: transaction });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @route  GET /api/transactions/summary
// @desc   Get monthly summary (income, expenses, balance)
// @access Private
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month ? parseInt(month) - 1 : now.getMonth();
    const queryYear = year ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(queryYear, queryMonth, 1);
    const endOfMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    res.json({
      success: true,
      data: {
        income,
        expenses,
        balance: income - expenses,
        month: startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/transactions/categories
// @desc   Get expense breakdown by category for current month
// @access Private
router.get('/categories', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month ? parseInt(month) - 1 : now.getMonth();
    const queryYear = year ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(queryYear, queryMonth, 1);
    const endOfMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const breakdown = {};
    let totalExpenses = 0;

    transactions.forEach((t) => {
      if (!breakdown[t.category]) {
        breakdown[t.category] = 0;
      }
      breakdown[t.category] += t.amount;
      totalExpenses += t.amount;
    });

    const data = Object.keys(breakdown).map((cat) => ({
      category: cat,
      amount: breakdown[cat],
      percentage: totalExpenses > 0 ? (breakdown[cat] / totalExpenses) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    res.json({ success: true, total: totalExpenses, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/transactions/report
// @desc   Get monthly report metrics (total spent, transaction count, daily avg, budget usage)
// @access Private
router.get('/report', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month ? parseInt(month) - 1 : now.getMonth();
    const queryYear = year ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(queryYear, queryMonth, 1);
    const endOfMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);
    
    // Days in queried month and days passed (if current month)
    const totalDaysInMonth = new Date(queryYear, queryMonth + 1, 0).getDate();
    const daysPassed = (queryMonth === now.getMonth() && queryYear === now.getFullYear()) 
      ? now.getDate() 
      : totalDaysInMonth;

    // Fetch transactions
    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const expenses = transactions.filter(t => t.type === 'expense');
    const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);
    const transactionCount = transactions.length;
    const dailyAvg = totalSpent / daysPassed;

    // Fetch total budget limit
    const budgets = await Budget.find({ user: req.user._id });
    const totalBudgetLimit = budgets.reduce((s, b) => s + b.limit, 0);
    const budgetUsedPercent = totalBudgetLimit > 0 ? (totalSpent / totalBudgetLimit) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalSpent,
        transactionCount,
        dailyAvg,
        budgetUsedPercent,
        totalBudgetLimit,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/transactions/chart
// @desc   Get 6-month expense chart data
// @access Private
router.get('/chart', async (req, res) => {
  try {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const transactions = await Transaction.find({
        user: req.user._id,
        type: 'expense',
        date: { $gte: start, $lte: end },
      });

      const total = transactions.reduce((s, t) => s + t.amount, 0);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        total,
        isCurrent: i === 0,
      });
    }

    res.json({ success: true, data: months });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/transactions/daily
// @desc   Get daily spending for the current month
// @access Private
router.get('/daily', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month ? parseInt(month) - 1 : now.getMonth();
    const queryYear = year ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(queryYear, queryMonth, 1);
    const endOfMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);
    
    const totalDays = new Date(queryYear, queryMonth + 1, 0).getDate();

    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const dailyActivity = [];
    for (let day = 1; day <= totalDays; day++) {
      const dayTotal = transactions
        .filter(t => new Date(t.date).getDate() === day)
        .reduce((s, t) => s + t.amount, 0);
      
      dailyActivity.push({
        day,
        total: dayTotal,
        isFuture: (queryYear > now.getFullYear()) || (queryYear === now.getFullYear() && queryMonth > now.getMonth()) || (queryYear === now.getFullYear() && queryMonth === now.getMonth() && day > now.getDate()),
      });
    }

    res.json({ success: true, count: dailyActivity.length, data: dailyActivity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  DELETE /api/transactions/all
// @desc   Delete all transactions for the current user
// @access Private
router.delete('/all', async (req, res) => {
  try {
    await Transaction.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'All transactions deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/transactions/stats
// @desc   Get overall stats (total entries, total tracked)
// @access Private
router.get('/stats', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    const totalEntries = transactions.length;
    const totalTracked = transactions.reduce((s, t) => s + t.amount, 0);

    res.json({
      success: true,
      data: {
        totalEntries,
        totalTracked,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/transactions/:id
// @desc   Update a transaction
// @access Private
router.put('/:id', async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  DELETE /api/transactions/:id
// @desc   Delete a transaction
// @access Private
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
