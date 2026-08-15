const express = require('express');
const mongoose = require('mongoose');
const { Income, Expense, Goal, Investment, Habit, HabitLog } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/analytics/summary
router.get('/summary', async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const [
      incomeAgg,
      expenseAgg,
      goalsAgg,
      investmentsAgg,
      categoryAgg,
      incomeMonthly,
      expenseMonthly,
      habitCount,
      habitsCompletedToday,
    ] = await Promise.all([
      Income.aggregate([
        { $match: { user_id: userObjectId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user_id: userObjectId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Goal.aggregate([
        { $match: { user_id: userObjectId } },
        { $group: { _id: null, total: { $sum: '$saved_amount' } } },
      ]),
      Investment.aggregate([
        { $match: { user_id: userObjectId } },
        {
          $group: {
            _id: null,
            totalInvested: { $sum: '$amount_invested' },
            totalCurrent: { $sum: '$current_value' },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { user_id: userObjectId } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $project: { _id: 0, category: '$_id', total: 1 } },
        { $sort: { total: -1 } },
      ]),
      Income.aggregate([
        { $match: { user_id: userObjectId } },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] },
            income: { $sum: '$amount' },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { user_id: userObjectId } },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] },
            expense: { $sum: '$amount' },
          },
        },
      ]),
      Habit.countDocuments({ user_id: userObjectId }),
      HabitLog.distinct('habit_id', {
        user_id: userObjectId,
        completed_on: new Date().toISOString().slice(0, 10),
      }),
    ]);

    const totalIncome = incomeAgg.length ? Number(incomeAgg[0].total) : 0;
    const totalExpense = expenseAgg.length ? Number(expenseAgg[0].total) : 0;
    const totalSavedGoals = goalsAgg.length ? Number(goalsAgg[0].total) : 0;
    const inv = investmentsAgg.length ? Number(investmentsAgg[0].totalInvested) : 0;
    const cur = investmentsAgg.length ? Number(investmentsAgg[0].totalCurrent) : 0;

    const netCashSavings = totalIncome - totalExpense;
    const netWorth = netCashSavings + cur;

    // Combine monthly data
    const monthMap = {};
    incomeMonthly.forEach((i) => {
      monthMap[i._id] = monthMap[i._id] || { month: i._id, income: 0, expense: 0 };
      monthMap[i._id].income = i.income;
    });
    expenseMonthly.forEach((e) => {
      monthMap[e._id] = monthMap[e._id] || { month: e._id, income: 0, expense: 0 };
      monthMap[e._id].expense = e.expense;
    });
    const monthly = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      total_income: totalIncome,
      total_expense: totalExpense,
      net_cash_savings: netCashSavings,
      total_invested: inv,
      investments_current_value: cur,
      total_saved_in_goals: totalSavedGoals,
      net_worth: netWorth,
      monthly,
      category_breakdown: categoryAgg,
      habit_count: habitCount,
      habits_completed_today: habitsCompletedToday.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
