const express = require('express');
const { Income } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/income
router.get('/', async (req, res, next) => {
  try {
    const rows = await Income.find({ user_id: req.user.id }).sort({ date: -1, _id: -1 });
    res.json(rows.map(r => r.toJSON()));
  } catch (err) {
    next(err);
  }
});

// POST /api/income
router.post('/', async (req, res, next) => {
  try {
    const { source, amount, date, note } = req.body || {};
    if (!source || amount === undefined || !date) {
      return res.status(400).json({ error: 'source, amount and date are required' });
    }
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt < 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const doc = await Income.create({
      user_id: req.user.id,
      source: String(source).trim(),
      amount: amt,
      date: String(date).trim(),
      note: note ? String(note).trim() : '',
    });

    res.status(201).json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/income/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Income.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
