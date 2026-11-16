import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowLeft, Pencil, Trash2, Search } from "lucide-react";
import API from "../services/api";
import "./Transactions.css";
import AddTransactionModal from "../components/AddTransactionModal";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: "",
    paymentMethod: "UPI",
    notes: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all transactions from the backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/transactions");

      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  // Reset to first page whenever filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, paymentFilter, startDate, endDate, sortBy]);

  // Delete a transaction
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/transactions/${id}`);

      // Remove the deleted transaction from the screen
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id !== id),
      );

      alert("Transaction deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete transaction.");
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);

    const transactionDate = new Date(transaction.date);
    const formattedDate = [
      transactionDate.getFullYear(),
      String(transactionDate.getMonth() + 1).padStart(2, "0"),
      String(transactionDate.getDate()).padStart(2, "0"),
    ].join("-");

    setEditForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: formattedDate,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes || "",
    });

    setUpdateError("");
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdateLoading(true);
      setUpdateError("");

      const updatedData = {
        ...editForm,
        amount: Number(editForm.amount),
      };

      const response = await API.put(
        `/transactions/${editingTransaction._id}`,
        updatedData,
      );

      const updatedTransaction = response.data.transaction || response.data;

      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === editingTransaction._id
            ? { ...transaction, ...updatedData, ...updatedTransaction }
            : transaction,
        ),
      );

      setShowEditModal(false);
      setEditingTransaction(null);

      alert("Transaction updated successfully!");
    } catch (err) {
      setUpdateError(
        err.response?.data?.message || "Failed to update transaction.",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Filter transactions by category or notes
  const filteredTransactions = transactions.filter((transaction) => {
    const searchValue = searchTerm.toLowerCase().trim();

    const matchesSearch =
      (transaction.category || "").toLowerCase().includes(searchValue) ||
      (transaction.notes || "").toLowerCase().includes(searchValue);

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesPayment =
      paymentFilter === "all" || transaction.paymentMethod === paymentFilter;

    const transactionDate = new Date(transaction.date);

    const formattedDate = [
      transactionDate.getFullYear(),
      String(transactionDate.getMonth() + 1).padStart(2, "0"),
      String(transactionDate.getDate()).padStart(2, "0"),
    ].join("-");

    const matchesStartDate = !startDate || formattedDate >= startDate;

    const matchesEndDate = !endDate || formattedDate <= endDate;

    return (
      matchesSearch &&
      matchesType &&
      matchesPayment &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  // Sort the filtered transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.date) - new Date(b.date);

      case "amount-low":
        return Number(a.amount) - Number(b.amount);

      case "amount-high":
        return Number(b.amount) - Number(a.amount);

      case "newest":
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });
  // Pagination calculations
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  // Keep current page valid if transactions are deleted
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Calculate transaction summary
  const totalTransactions = filteredTransactions.length;

  const totalIncome = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalExpenses = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div>
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <h1>All Transactions</h1>
          <p>View and manage your income and expenses.</p>
        </div>

        <button
          type="button"
          className="add-transaction-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Transaction Summary Cards */}
      <div className="transaction-summary-cards">
        <div className="transaction-summary-card total-card">
          <h3>Total Transactions</h3>
          <h2>{totalTransactions}</h2>
          <p>Transactions found</p>
        </div>

        <div className="transaction-summary-card income-card">
          <h3>Total Income</h3>
          <h2>
            {totalIncome.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            })}
          </h2>
          <p>Your total income</p>
        </div>

        <div className="transaction-summary-card expense-card">
          <h3>Total Expenses</h3>
          <h2>
            {totalExpenses.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            })}
          </h2>
          <p>Your total expenses</p>
        </div>
      </div>

      <div className="transactions-card">
        <div className="transactions-card-header">
          <h2>Transaction History</h2>
          <span>{filteredTransactions.length} transactions</span>
        </div>

        <div className="transactions-filters">
          {/* Search */}
          <div className="transactions-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search by category or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Transaction Type Filter */}
          <select
            className="transaction-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Payment Method Filter */}
          <select
            className="transaction-filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
          {/* Start Date */}
          <input
            type="date"
            className="transaction-filter-select"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Start date"
          />

          {/* End Date */}
          <input
            type="date"
            className="transaction-filter-select"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="End date"
          />

          {/* Sorting */}
          <select
            className="transaction-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-low">Amount: Low to High</option>
            <option value="amount-high">Amount: High to Low</option>
          </select>

          {/* Clear Filters */}
          <button
            type="button"
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setPaymentFilter("all");
              setStartDate("");
              setEndDate("");
              setSortBy("newest");
            }}
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <p className="transactions-message">Loading transactions...</p>
        ) : error ? (
          <p className="transactions-error">{error}</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="transactions-message">
            {searchTerm
              ? "No matching transactions found."
              : "No transactions found. Add your first transaction!"}
          </p>
        ) : (
          <>
            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Payment Method</th>
                    <th>Notes</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>
                        {new Date(transaction.date).toLocaleDateString("en-IN")}
                      </td>

                      <td>{transaction.category}</td>

                      <td>
                        <span
                          className={`transaction-type ${transaction.type}`}
                        >
                          {transaction.type}
                        </span>
                      </td>

                      <td>{transaction.paymentMethod}</td>
                      <td>{transaction.notes || "-"}</td>

                      <td className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {Number(transaction.amount).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        <div className="transaction-actions">
                          <button
                            type="button"
                            className="edit-btn"
                            title="Edit transaction"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            title="Delete transaction"
                            onClick={() => handleDelete(transaction._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-container">
              <p className="pagination-info">
                Showing {startIndex + 1}–
                {Math.min(endIndex, sortedTransactions.length)} of{" "}
                {sortedTransactions.length} transactions
              </p>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`pagination-btn ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==============================
          EDIT TRANSACTION MODAL
      ============================== */}

      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <div>
                <h2>Edit Transaction</h2>
                <p>Update your transaction details.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              {updateError && <p className="edit-error">{updateError}</p>}

              <div className="edit-form-grid">
                <div className="edit-form-group">
                  <label>Transaction Type</label>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div className="edit-form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="edit-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-form-group">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={editForm.paymentMethod}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="edit-form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-edit-btn"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Updating..." : "Update Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTransactions}
        />
      )}
    </div>
  );
}

export default Transactions;
