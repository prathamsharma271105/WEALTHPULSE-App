const express = require('express');
const { Expense } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/expenses
router.get('/', async (req, res, next) => {
  try {
    const { month } = req.query;
    const query = { user_id: req.user.id };
    if (month) {
      query.date = { $regex: new RegExp(`^${month}`) };
    }
    const rows = await Expense.find(query).sort({ date: -1, _id: -1 });
    res.json(rows.map(r => r.toJSON()));
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses
router.post('/', async (req, res, next) => {
  try {
    const { category, amount, date, note } = req.body || {};
    if (!category || amount === undefined || !date) {
      return res.status(400).json({ error: 'category, amount and date are required' });
    }
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt < 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const doc = await Expense.create({
      user_id: req.user.id,
      category: String(category).trim(),
      amount: amt,
      date: String(date).trim(),
      note: note ? String(note).trim() : '',
    });

    res.status(201).json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Expense.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/summary/monthly
router.get('/summary/monthly', async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const rows = await Expense.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            month: { $substr: ['$date', 0, 7] },
            category: '$category',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          category: '$_id.category',
          total: 1,
        },
      },
      { $sort: { month: -1 } },
    ]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
