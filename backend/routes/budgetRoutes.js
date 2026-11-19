const express = require('express');

const router = express.Router();

const {
  getBudget,
  saveBudget,
  getBudgetSummary
} = require('../controllers/budgetController');

const protect = require('../middleware/authMiddleware');

// Get monthly budget
router.get('/', protect, getBudget);

// Create or update monthly budget
router.post('/', protect, saveBudget);

// Get budget summary with actual spending
router.get('/summary', protect, getBudgetSummary);

module.exports = router;