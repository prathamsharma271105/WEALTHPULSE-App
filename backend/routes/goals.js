const express = require('express');
const { Goal } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/goals
router.get('/', async (req, res, next) => {
  try {
    const rows = await Goal.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(rows.map(g => g.toJSON()));
  } catch (err) {
    next(err);
  }
});

// POST /api/goals
router.post('/', async (req, res, next) => {
  try {
    const { title, target_amount, deadline, saved_amount } = req.body || {};
    if (!title || !String(title).trim() || target_amount === undefined) {
      return res.status(400).json({ error: 'Goal title and target_amount are required' });
    }
    const target = Number(target_amount);
    if (Number.isNaN(target) || target <= 0) {
      return res.status(400).json({ error: 'target_amount must be greater than 0' });
    }
    const saved = Number(saved_amount) || 0;

    const doc = await Goal.create({
      user_id: req.user.id,
      title: String(title).trim(),
      target_amount: target,
      saved_amount: saved,
      deadline: deadline ? String(deadline).trim() : null,
    });

    res.status(201).json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});

// PATCH /api/goals/:id/contribute -> add to saved_amount
router.patch('/:id/contribute', async (req, res, next) => {
  try {
    const { amount } = req.body || {};
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Contribution amount must be greater than 0' });
    }

    const doc = await Goal.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Goal not found' });

    doc.saved_amount = Number(doc.saved_amount || 0) + amt;
    await doc.save();

    res.json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Goal.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
