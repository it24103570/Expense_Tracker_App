const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const connectDB = require('./config/db');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    
    const defaults = [
      { name: 'Food', type: 'expense', isDefault: true },
      { name: 'Transport', type: 'expense', isDefault: true },
      { name: 'Salary', type: 'income', isDefault: true },
      { name: 'Utilities', type: 'expense', isDefault: true },
      { name: 'Entertainment', type: 'expense', isDefault: true },
      { name: 'Shopping', type: 'expense', isDefault: true },
      { name: 'Health', type: 'expense', isDefault: true },
      { name: 'Investment', type: 'income', isDefault: true }
    ];

    const existing = await Category.countDocuments({ isDefault: true });
    if (existing === 0) {
      await Category.insertMany(defaults);
      console.log('✅ Default categories seeded successfully!');
    } else {
      console.log('ℹ️ Default categories already exist in DB.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
};

seed();
