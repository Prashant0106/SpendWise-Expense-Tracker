
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AddTransaction.css'

import API from '../services/api';

function AddTransaction() {

  const navigate = useNavigate();

  // Get today's date in local time
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Form data
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: getTodayDate(),
    paymentMethod: 'UPI',
    notes: ''
  });

  // Loading and messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Submit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    setLoading(true);

    try {

      const transactionData = {
        ...formData,
        amount: Number(formData.amount)
      };

      const response = await API.post(
        '/transactions',
        transactionData
      );

      setSuccess(
        response.data.message || 'Transaction added successfully!'
      );

      // Navigate to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        'Unable to add transaction. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="add-transaction-container">

      <div className="add-transaction-card">

        <h1>Add Transaction</h1>

        <p>Record your income and expenses.</p>

        {/* Success Message */}
        {success && (
          <p className="success-message">
            {success}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          {/* Transaction Type */}
          <div className="form-group">

            <label>Transaction Type</label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

          </div>

          {/* Amount */}
          <div className="form-group">

            <label>Amount (₹)</label>

            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />

          </div>

          {/* Category */}
          <div className="form-group">

            <label>Category</label>

            <input
              type="text"
              name="category"
              placeholder="Example: Food, Salary, Travel"
              value={formData.category}
              onChange={handleChange}
              required
            />

          </div>

          {/* Date */}
          <div className="form-group">

            <label>Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

          </div>

          {/* Payment Method */}
          <div className="form-group">

            <label>Payment Method</label>

            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>

          </div>

          {/* Notes */}
          <div className="form-group">

            <label>Notes</label>

            <textarea
              name="notes"
              placeholder="Add additional details (optional)"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />

          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Transaction'}
          </button>

        </form>

        <Link to="/dashboard">
          Back to Dashboard
        </Link>

      </div>

    </div>
  );
}

export default AddTransaction;
