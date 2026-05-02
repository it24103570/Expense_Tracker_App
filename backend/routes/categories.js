const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route  POST /api/categories
// @desc   Create a custom category
// @access Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, type } = req.body;

    try {
      // Optional: Prevent duplicate names per user
      const existing = await Category.findOne({ name, user: req.user._id });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }

      const category = await Category.create({
        name,
        type,
        user: req.user._id,
        isDefault: false,
      });

      res.status(201).json({ success: true, data: category });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @route  GET /api/categories
// @desc   Get all available categories (default + user's custom)
// @access Private
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { user: req.user._id }
      ]
    });

    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/categories/:id
// @desc   Update a custom category
// @access Private
router.put('/:id', async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Security Rules
    if (category.isDefault) {
      return res.status(403).json({ success: false, message: 'Cannot edit default categories' });
    }

    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this category' });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, type: req.body.type }, // prevent altering user/isDefault
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  DELETE /api/categories/:id
// @desc   Delete a custom category
// @access Private
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Security Rules
    if (category.isDefault) {
      return res.status(403).json({ success: false, message: 'Cannot delete default categories' });
    }

    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this category' });
    }

    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/categories/seed
// @desc   Seed default categories (Helper endpoint to initialize DB)
// @access Public (or restrict to admin if needed)
router.post('/seed', async (req, res) => {
  try {
    const defaults = [
      { name: 'Food', type: 'expense', isDefault: true },
      { name: 'Transport', type: 'expense', isDefault: true },
      { name: 'Salary', type: 'income', isDefault: true },
      { name: 'Utilities', type: 'expense', isDefault: true },
      { name: 'Entertainment', type: 'expense', isDefault: true }
    ];

    // Only insert if no defaults exist to prevent duplicates
    const existingDefaults = await Category.countDocuments({ isDefault: true });
    
    if (existingDefaults === 0) {
        const inserted = await Category.insertMany(defaults);
        return res.status(201).json({ success: true, data: inserted });
    }

    res.status(200).json({ success: true, message: 'Default categories already seeded' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
