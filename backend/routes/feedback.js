const express = require('express');
const { Feedback } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/feedback  (auth required)
router.post('/', auth, async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    const doc = await Feedback.create({
      user_id: req.user.id,
      message: message.trim(),
    });
    res.status(201).json({ id: doc.id, ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
