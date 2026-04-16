const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  },
});

router.use(protect);

// @route  POST /api/users/upload-avatar
// @desc   Upload profile picture
// @access Private
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.json({
      success: true,
      profilePicture: user.profilePicture,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        joinDate: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  DELETE /api/users/avatar
// @desc   Remove profile picture
// @access Private
router.delete('/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.profilePicture = '';
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture removed',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: '',
        joinDate: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/users/profile
// @desc   Update user profile
// @access Private
router.put(
  '/profile',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  async (req, res) => {
    console.log(`Profile update request for user: ${req.user._id}`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email } = req.body;

    try {
      // Check if email is taken by another user
      const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, email },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          joinDate: user.createdAt,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @route  PUT /api/users/password
// @desc   Change password
// @access Private
router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user._id).select('+password');
      if (!(await user.matchPassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
