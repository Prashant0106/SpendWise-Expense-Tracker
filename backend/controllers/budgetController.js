const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Get Budget for a Specific Month
const getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();

    const selectedMonth = month
      ? Number(month)
      : currentDate.getMonth() + 1;

    const selectedYear = year
      ? Number(year)
      : currentDate.getFullYear();

    const budget = await Budget.findOne({
      userId: req.user._id,
      month: selectedMonth,
      year: selectedYear
    });

    res.status(200).json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Get Budget Error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch budget'
    });
  }
};
// Create or Update Budget
const saveBudget = async (req, res) => {
  try {
    const {
      month,
      year,
      totalBudget,
      categoryBudgets
    } = req.body;

    if (
      month === undefined ||
      year === undefined ||
      totalBudget === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Month, year and total budget are required'
      });
    }

    if (
      month < 1 ||
      month > 12 ||
      !Number.isInteger(Number(month))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month'
      });
    }

    if (
      !Number.isInteger(Number(year)) ||
      Number(year) < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year'
      });
    }

    if (Number(totalBudget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget cannot be negative'
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        month: Number(month),
        year: Number(year)
      },
      {
        totalBudget: Number(totalBudget),
        categoryBudgets: categoryBudgets || []
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      budget
    });

  } catch (error) {
    console.error('Save Budget Error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to save budget'
    });
  }
};
// Get Budget Summary with Actual Expenses
const getBudgetSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();

    const selectedMonth = month
      ? Number(month)
      : currentDate.getMonth() + 1;

    const selectedYear = year
      ? Number(year)
      : currentDate.getFullYear();

    const startDate = new Date(
      Date.UTC(selectedYear, selectedMonth - 1, 1)
    );

    const endDate = new Date(
      Date.UTC(selectedYear, selectedMonth, 1)
    );

    // Find the budget
    const budget = await Budget.findOne({
      userId: req.user._id,
      month: selectedMonth,
      year: selectedYear
    });

    // Find all expenses for the selected month
    const expenses = await Transaction.find({
      userId: req.user._id,
      type: 'expense',
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    // Calculate total expenses
    const totalSpent = expenses.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

    // Calculate category-wise spending
    const categorySpending = {};

    expenses.forEach((transaction) => {
      const category = transaction.category;

      categorySpending[category] =
        (categorySpending[category] || 0) +
        transaction.amount;
    });

    res.status(200).json({
      success: true,
      month: selectedMonth,
      year: selectedYear,
      budget,
      totalSpent,
      remainingBudget: budget
        ? budget.totalBudget - totalSpent
        : null,
      categorySpending
    });

  } catch (error) {
    console.error('Budget Summary Error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to calculate budget summary'
    });
  }
};
module.exports = { getBudget, saveBudget, getBudgetSummary};