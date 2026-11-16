

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this transaction
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Transaction date
    date: {
      type: Date,
      required: true,
      default: Date.now
    },

    // Transaction amount
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },

    // Transaction category
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },

    // Payment method
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: [
        'Cash',
        'Credit Card',
        'UPI',
        'Bank Transfer',
        'Other'
      ]
    },

    // Income or Expense
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense']
    },

    // Additional information
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster user-specific queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, paymentMethod: 1 });

// Create Transaction Model
const Transaction = mongoose.model(
  'Transaction',
  transactionSchema
);

module.exports = Transaction;
