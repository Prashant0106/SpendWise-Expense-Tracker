const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    // User who owns this budget
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Budget month (1-12)
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },

    // Budget year
    year: {
      type: Number,
      required: true
    },

    // Overall monthly spending limit
    totalBudget: {
      type: Number,
      required: true,
      min: 0
    },

    // Category-specific budgets
    categoryBudgets: [
      {
        category: {
          type: String,
          required: true,
          trim: true
        },

        limit: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Prevent duplicate budgets for the same user and month
budgetSchema.index(
  { userId: 1, month: 1, year: 1 },
  { unique: true }
);

// Create Budget model
const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;