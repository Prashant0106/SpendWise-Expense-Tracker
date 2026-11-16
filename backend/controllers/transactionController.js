
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Add new transaction
const createTransaction = async (req, res) => {
  try {
    // 1. Get transaction details from request body
    const {
      date,
      amount,
      category,
      paymentMethod,
      type,
      notes
    } = req.body;

    // 2. Validate required fields
    if (
      amount === undefined ||
      !category ||
      !paymentMethod ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, category, payment method and type'
      });
    }

    // 3. Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // 4. Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      date,
      amount,
      category,
      paymentMethod,
      type,
      notes
    });

    // 5. Send response
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });

  } catch (error) {
    console.error('Create Transaction Error:', error);

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction'
    });
  }
};

// Get all transactions for logged-in user
const getAllTransactions = async (req, res) => {
  try {
    // Find transactions belonging to current user
    const transactions = await Transaction.find({
      userId: req.user._id
    }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error('Get Transactions Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
};

// Get single transaction by ID
const getTransactionById = async (req, res) => {
  try {
    // 1. Get transaction ID from URL
    const { id } = req.params;

    // 2. Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    // 3. Find transaction belonging to logged-in user
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    });

    // 4. Check if transaction exists
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // 5. Return transaction
    res.status(200).json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Get Transaction Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction'
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    // 1. Get transaction ID
    const { id } = req.params;

    // 2. Validate ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    // 3. Find transaction belonging to logged-in user
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // 4. Allowed fields
    const allowedFields = [
      'date',
      'amount',
      'category',
      'paymentMethod',
      'type',
      'notes'
    ];

    // 5. Update only permitted fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        transaction.set(field, req.body[field]);
      }
    }

    // 6. Save updated transaction
    await transaction.save();

    // 7. Send response
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });

  } catch (error) {
    console.error('Update Transaction Error:', error);

    if (
      error.name === 'ValidationError' ||
      error.name === 'CastError'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction'
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate transaction ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    // Find and delete only the logged-in user's transaction
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete Transaction Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction'
    });
  }
};
// Dashboard Summary

const getDashboardSummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $group: {
          _id: null,

          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'income'] },
                '$amount',
                0
              ]
            }
          },

          totalExpenses: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'expense'] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          balance: {
            $subtract: ['$totalIncome', '$totalExpenses']
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      summary: summary[0] || {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
      }
    });

  } catch (error) {
    console.error('Dashboard Summary Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard summary'
    });
  }
};
// Monthly Summary

const getMonthlySummary = async (req, res) => {
  try {
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: {
            $sum: '$amount'
          }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      monthlyData
    });

  } catch (error) {
    console.error('Monthly Summary Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly summary'
    });
  }
};
// Category Summary

const getCategorySummary = async (req, res) => {
  try {
    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense'
        }
      },
      {
        $group: {
          _id: '$category',
          total: {
            $sum: '$amount'
          }
        }
      },
      {
        $sort: {
          total: -1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      categoryData
    });

  } catch (error) {
    console.error('Category Summary Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching category summary'
    });
  }
};
// Recent Transaction

const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id
    })
      .sort({
        date: -1,
        createdAt: -1
      })
      .limit(5);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error('Recent Transactions Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent transactions'
    });
  }
};


// Export controller
module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
  getMonthlySummary,
  getCategorySummary,
  getRecentTransactions
};
