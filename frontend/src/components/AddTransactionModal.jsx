import { useState } from "react";
import { X } from "lucide-react";
import API from "../services/api";
import "./AddTransactionModal.css";

function AddTransactionModal({ onClose, onSuccess }) {
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: getTodayDate(),
    paymentMethod: "UPI",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(formData.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        ...formData,
        amount: Number(formData.amount),
      };

      await API.post("/transactions", transactionData);

      await onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add transaction. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-modal-overlay" onClick={onClose}>
      <div className="add-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="add-modal-header">
          <div>
            <h2>Add Transaction</h2>
            <p>Record your income and expenses.</p>
          </div>

          <button
            type="button"
            className="add-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && <p className="add-modal-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="add-modal-grid">
            <div className="add-modal-group">
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

            <div className="add-modal-group">
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

            <div className="add-modal-group">
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

            <div className="add-modal-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-modal-group">
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

            <div className="add-modal-group">
              <label>Notes</label>
              <textarea
                name="notes"
                placeholder="Add additional details (optional)"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>

          <div className="add-modal-actions">
            <button
              type="button"
              className="add-modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-modal-submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
