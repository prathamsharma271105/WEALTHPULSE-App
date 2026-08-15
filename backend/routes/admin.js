const express = require('express');
const { User, Income, Expense, Goal, Habit, HabitLog, Feedback } = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(auth, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [
      usersCount,
      incomeAgg,
      expenseAgg,
      goalsCount,
      habitsCount,
      completedHabitsCount,
      completedTodayCount,
      feedbackCount,
    ] = await Promise.all([
      User.countDocuments(),
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Goal.countDocuments(),
      Habit.countDocuments(),
      HabitLog.countDocuments(),
      HabitLog.countDocuments({ completed_on: today }),
      Feedback.countDocuments({ status: 'open' }),
    ]);

    const totalIncome = incomeAgg.length ? Number(incomeAgg[0].total) : 0;
    const totalExpense = expenseAgg.length ? Number(expenseAgg[0].total) : 0;

    res.json({
      users: usersCount,
      total_users: usersCount,
      total_income: totalIncome,
      total_expense: totalExpense,
      total_goals: goalsCount,
      total_habits: habitsCount,
      total_habit_completions: completedHabitsCount,
      habits_completed_today: completedTodayCount,
      open_feedback: feedbackCount,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    const result = await Promise.all(
      users.map(async (u) => {
        const [income_count, expense_count, habit_count, goal_count] = await Promise.all([
          Income.countDocuments({ user_id: u._id }),
          Expense.countDocuments({ user_id: u._id }),
          Habit.countDocuments({ user_id: u._id }),
          Goal.countDocuments({ user_id: u._id }),
        ]);
        const json = u.toJSON();
        return {
          ...json,
          income_count,
          expense_count,
          habit_count,
          goal_count,
        };
      })
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin' });
    }
    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove admin privileges from your own account' });
    }
    const doc = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true });
    if (!doc) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, role });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }
    const uid = req.params.id;
    const doc = await User.findByIdAndDelete(uid);
    if (!doc) return res.status(404).json({ error: 'User not found' });

    // Cleanup user data
    await Promise.all([
      Income.deleteMany({ user_id: uid }),
      Expense.deleteMany({ user_id: uid }),
      HabitLog.deleteMany({ user_id: uid }),
      Habit.deleteMany({ user_id: uid }),
      Goal.deleteMany({ user_id: uid }),
      Feedback.deleteMany({ user_id: uid }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/feedback
router.get('/feedback', async (req, res, next) => {
  try {
    const rows = await Feedback.find().populate('user_id', 'name email').sort({ created_at: -1 });
    const result = rows.map((f) => {
      const json = f.toJSON();
      return {
        ...json,
        user_name: f.user_id?.name || null,
        user_email: f.user_id?.email || null,
      };
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/feedback/:id -> resolve
router.patch('/feedback/:id', async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!status || !['open', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'status must be open or resolved' });
    }
    const doc = await Feedback.findByIdAndUpdate(req.params.id, { $set: { status } });
    if (!doc) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
