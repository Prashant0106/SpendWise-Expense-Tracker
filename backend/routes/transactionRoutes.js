

const express = require('express');

const router = express.Router();

// Import middleware
const protect = require('../middleware/authMiddleware');

// Import controller
const {
  createTransaction, getAllTransactions,
  getTransactionById, updateTransaction,
  deleteTransaction, getDashboardSummary,
  getMonthlySummary, getCategorySummary,
  getRecentTransactions
} = require('../controllers/transactionController');

// Add transaction (Protected)
router.post('/', protect, createTransaction);

// Get all transactions
router.get('/', protect, getAllTransactions);

// Dashboard Summary
router.get('/summary', protect, getDashboardSummary);

//Monthly Summary
router.get('/monthly-summary', protect, getMonthlySummary)

// Category Summary
router.get('/category-summary', protect, getCategorySummary)

// Recent Transactions
router.get('/recent', protect, getRecentTransactions)

// Get single transaction by ID
router.get('/:id', protect, getTransactionById);

// Update transaction
router.put('/:id', protect, updateTransaction);

// Delete Transaction
router.delete('/:id', protect, deleteTransaction);


module.exports = router;
