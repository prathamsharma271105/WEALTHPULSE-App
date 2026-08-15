const express = require('express');
const { Investment } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/investments
router.get('/', async (req, res, next) => {
  try {
    const rows = await Investment.find({ user_id: req.user.id }).sort({ date: -1, _id: -1 });
    res.json(rows.map(r => r.toJSON()));
  } catch (err) {
    next(err);
  }
});

// POST /api/investments
router.post('/', async (req, res, next) => {
  try {
    const { asset_name, asset_type, amount_invested, current_value, date } = req.body || {};
    if (!asset_name || !String(asset_name).trim() || !asset_type || amount_invested === undefined || current_value === undefined || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const invested = Number(amount_invested);
    const current = Number(current_value);
    if (Number.isNaN(invested) || invested < 0) {
      return res.status(400).json({ error: 'amount_invested must be a non-negative number' });
    }
    if (Number.isNaN(current) || current < 0) {
      return res.status(400).json({ error: 'current_value must be a non-negative number' });
    }

    const doc = await Investment.create({
      user_id: req.user.id,
      asset_name: String(asset_name).trim(),
      asset_type: String(asset_type).trim(),
      amount_invested: invested,
      current_value: current,
      date: String(date).trim(),
    });

    res.status(201).json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});

// PATCH /api/investments/:id -> update current_value
router.patch('/:id', async (req, res, next) => {
  try {
    const { current_value } = req.body || {};
    if (current_value === undefined) {
      return res.status(400).json({ error: 'current_value required' });
    }
    const val = Number(current_value);
    if (Number.isNaN(val) || val < 0) {
      return res.status(400).json({ error: 'current_value must be a non-negative number' });
    }

    const doc = await Investment.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { $set: { current_value: val } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Investment not found' });
    res.json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/investments/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Investment.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
