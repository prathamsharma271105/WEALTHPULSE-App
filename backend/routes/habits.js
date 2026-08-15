const express = require('express');
const { Habit, HabitLog } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function calcStreak(logs, frequency) {
  if (!logs || !logs.length) return 0;
  
  const uniqueDates = Array.from(
    new Set(logs.map((l) => (typeof l === 'string' ? l : l.completed_on)))
  )
    .filter(Boolean)
    .sort()
    .reverse();

  if (!uniqueDates.length) return 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date(todayStr + 'T00:00:00Z');
  const stepDays = frequency === 'weekly' ? 7 : frequency === 'monthly' ? 30 : 1;

  const mostRecent = new Date(uniqueDates[0] + 'T00:00:00Z');
  const daysSinceLatest = Math.round((today - mostRecent) / 86400000);

  if (daysSinceLatest > stepDays) return 0;

  let streak = 1;
  let anchor = mostRecent;

  for (let i = 1; i < uniqueDates.length; i++) {
    const cur = new Date(uniqueDates[i] + 'T00:00:00Z');
    const diff = Math.round((anchor - cur) / 86400000);

    if (diff === 0) {
      continue;
    }

    if (frequency === 'daily') {
      if (diff === 1) {
        streak += 1;
        anchor = cur;
      } else {
        break;
      }
    } else {
      if (diff <= stepDays) {
        continue;
      } else if (diff <= stepDays * 2) {
        streak += 1;
        anchor = cur;
      } else {
        break;
      }
    }
  }

  return streak;
}

// GET /api/habits
router.get('/', async (req, res, next) => {
  try {
    const habits = await Habit.find({ user_id: req.user.id }).sort({ created_at: -1 });
    const today = new Date().toISOString().slice(0, 10);

    const result = await Promise.all(
      habits.map(async (h) => {
        const logs = await HabitLog.find({ habit_id: h._id }).sort({ completed_on: -1 });
        const completedToday = logs.some((l) => l.completed_on === today);
        const json = h.toJSON();
        return {
          ...json,
          streak: calcStreak(logs, h.frequency),
          total_completions: logs.length,
          completed_today: completedToday,
          recent_logs: logs.slice(0, 14).map((l) => l.completed_on),
        };
      })
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/habits
router.post('/', async (req, res, next) => {
  try {
    const { name, frequency, target_amount } = req.body || {};
    if (!name || !String(name).trim() || !frequency) {
      return res.status(400).json({ error: 'Habit name and frequency are required' });
    }
    const freq = String(frequency).toLowerCase();
    if (!['daily', 'weekly', 'monthly'].includes(freq)) {
      return res.status(400).json({ error: 'Frequency must be daily, weekly or monthly' });
    }
    const target = Number(target_amount) || 0;
    if (target < 0) {
      return res.status(400).json({ error: 'Target amount cannot be negative' });
    }

    const doc = await Habit.create({
      user_id: req.user.id,
      name: String(name).trim(),
      frequency: freq,
      target_amount: target,
    });

    res.status(201).json({
      ...doc.toJSON(),
      streak: 0,
      total_completions: 0,
      completed_today: false,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/complete (Idempotent mark complete)
router.post('/:id/complete', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const date = (req.body && req.body.date) || new Date().toISOString().slice(0, 10);
    try {
      await HabitLog.create({
        habit_id: habit._id,
        user_id: req.user.id,
        completed_on: date,
      });
    } catch (e) {
      // Already completed for that date (unique index)
    }

    const logs = await HabitLog.find({ habit_id: habit._id }).sort({ completed_on: -1 });
    res.json({
      ok: true,
      completed_today: true,
      streak: calcStreak(logs, habit.frequency),
      total_completions: logs.length,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/toggle (Toggle completion for today or specified date)
router.post('/:id/toggle', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const date = (req.body && req.body.date) || new Date().toISOString().slice(0, 10);
    const existing = await HabitLog.findOne({
      habit_id: habit._id,
      completed_on: date,
    });

    let completedToday = false;
    if (existing) {
      await HabitLog.findByIdAndDelete(existing._id);
      completedToday = false;
    } else {
      await HabitLog.create({
        habit_id: habit._id,
        user_id: req.user.id,
        completed_on: date,
      });
      completedToday = true;
    }

    const logs = await HabitLog.find({ habit_id: habit._id }).sort({ completed_on: -1 });

    res.json({
      ok: true,
      completed_today: completedToday,
      streak: calcStreak(logs, habit.frequency),
      total_completions: logs.length,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Habit.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Habit not found' });
    await HabitLog.deleteMany({ habit_id: doc._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
