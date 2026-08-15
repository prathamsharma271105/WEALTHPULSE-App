const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Income, Expense, Habit, HabitLog, Goal, Investment, Feedback } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'wealthpulse_production_jwt_fallback_secret_key_2026';

function signToken(user) {
  const userId = user.id || user._id.toString();
  return jwt.sign(
    { sub: userId, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, currency, phone, income_target, savings_target } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const trimmedName = String(name).trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hash = bcrypt.hashSync(String(password), 10);
    const validCurrency = (currency && String(currency).trim().toUpperCase()) || 'INR';
    const validPhone = phone ? String(phone).trim() : '';
    const validIncomeTarget = Number(income_target) || 0;
    const validSavingsTarget = Number(savings_target) || 0;

    const userDoc = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password_hash: hash,
      role: 'user',
      currency: validCurrency,
      phone: validPhone,
      income_target: validIncomeTarget,
      savings_target: validSavingsTarget,
    });

    const user = userDoc.toJSON();
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userDoc = await User.findOne({ email: normalizedEmail });
    if (!userDoc) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = bcrypt.compareSync(String(password), userDoc.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const user = userDoc.toJSON();
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/profile
router.patch('/profile', auth, async (req, res, next) => {
  try {
    const { name, email, phone, currency, income_target, savings_target } = req.body || {};
    const updates = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (trimmed.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }
      updates.name = trimmed;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(409).json({ error: 'This email is already in use by another account' });
      }
      updates.email = normalizedEmail;
    }

    if (phone !== undefined) {
      updates.phone = String(phone).trim();
    }

    if (currency !== undefined) {
      const cur = String(currency).trim().toUpperCase();
      if (cur.length < 2 || cur.length > 5) {
        return res.status(400).json({ error: 'Invalid currency code' });
      }
      updates.currency = cur;
    }

    if (income_target !== undefined) {
      const val = Number(income_target);
      updates.income_target = Number.isNaN(val) || val < 0 ? 0 : val;
    }

    if (savings_target !== undefined) {
      const val = Number(savings_target);
      updates.savings_target = Number.isNaN(val) || val < 0 ? 0 : val;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    const updatedDoc = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
    if (!updatedDoc) return res.status(404).json({ error: 'User not found' });

    res.json({ user: updatedDoc.toJSON() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const userDoc = await User.findById(req.user.id);
    if (!userDoc) return res.status(404).json({ error: 'User not found' });

    const ok = bcrypt.compareSync(String(currentPassword), userDoc.password_hash);
    if (!ok) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHash = bcrypt.hashSync(String(newPassword), 10);
    userDoc.password_hash = newHash;
    await userDoc.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/delete-account
router.delete('/delete-account', auth, async (req, res, next) => {
  try {
    const uid = req.user.id;
    // Delete all user related data in MongoDB
    await Promise.all([
      Income.deleteMany({ user_id: uid }),
      Expense.deleteMany({ user_id: uid }),
      HabitLog.deleteMany({ user_id: uid }),
      Habit.deleteMany({ user_id: uid }),
      Goal.deleteMany({ user_id: uid }),
      Investment.deleteMany({ user_id: uid }),
      Feedback.deleteMany({ user_id: uid }),
      User.findByIdAndDelete(uid),
    ]);

    res.json({ message: 'Account and all financial data deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/export-all
router.get('/export-all', auth, async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [userDoc, income, expenses, habits, habitLogs, goals, investments] = await Promise.all([
      User.findById(uid),
      Income.find({ user_id: uid }).sort({ date: -1 }),
      Expense.find({ user_id: uid }).sort({ date: -1 }),
      Habit.find({ user_id: uid }).sort({ _id: 1 }),
      HabitLog.find({ user_id: uid }).sort({ completed_on: -1 }),
      Goal.find({ user_id: uid }).sort({ _id: 1 }),
      Investment.find({ user_id: uid }).sort({ date: -1 }),
    ]);

    const totalIncome = income.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalExpenses = expenses.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const netCashSavings = totalIncome - totalExpenses;
    const totalInvested = investments.reduce((s, r) => s + (Number(r.amount_invested) || 0), 0);
    const totalInvestmentsValue = investments.reduce((s, r) => s + (Number(r.current_value) || 0), 0);
    const totalSavedInGoals = goals.reduce((s, r) => s + (Number(r.saved_amount) || 0), 0);
    const netWorth = netCashSavings + totalInvestmentsValue;

    res.json({
      exported_at: new Date().toISOString(),
      platform: 'WealthPulse Intelligence',
      version: '2.0',
      user: userDoc ? userDoc.toJSON() : null,
      financial_summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_cash_savings: netCashSavings,
        total_invested: totalInvested,
        total_investments_value: totalInvestmentsValue,
        total_saved_in_goals: totalSavedInGoals,
        net_worth: netWorth,
        monthly_income_target: userDoc?.income_target || 0,
        monthly_savings_target: userDoc?.savings_target || 0,
      },
      income,
      expenses,
      habits,
      habit_logs: habitLogs,
      goals,
      investments,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
