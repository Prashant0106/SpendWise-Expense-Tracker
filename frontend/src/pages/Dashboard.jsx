import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AddTransactionModal from "../components/AddTransactionModal";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

import API from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./Dashboard.css";

function Dashboard() {
  // Dashboard data states
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        monthlyResponse,
        categoryResponse,
        recentResponse,
      ] = await Promise.all([
        API.get("/transactions/summary"),
        API.get("/transactions/monthly-summary"),
        API.get("/transactions/category-summary"),
        API.get("/transactions/recent"),
      ]);

      setSummary(summaryResponse.data.summary);
      setMonthlyData(monthlyResponse.data.monthlyData);
      setCategoryData(categoryResponse.data.categoryData);
      setRecentTransactions(recentResponse.data.transactions);
    } catch (error) {
      console.error("Dashboard Error:", error);

      setError(
        error.response?.data?.message || "Unable to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Convert monthly API response into chart data
  const monthlyChartData = monthlyData.reduce((result, item) => {
    const year = item._id.year;
    const month = item._id.month;

    const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
      month: "short",
    });

    const key = `${year}-${month}`;

    let existingMonth = result.find((entry) => entry.key === key);

    if (!existingMonth) {
      existingMonth = {
        key,
        month: `${monthName} ${year}`,
        income: 0,
        expense: 0,
      };

      result.push(existingMonth);
    }

    if (item._id.type === "income") {
      existingMonth.income = item.total;
    } else if (item._id.type === "expense") {
      existingMonth.expense = item.total;
    }

    return result;
  }, []);

  // Show loading message
  if (loading) {
    return <div className="dashboard-message">Loading dashboard...</div>;
  }

  // Show error message
  if (error) {
    return <div className="dashboard-message error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here's your financial overview.</p>
        </div>

        <button
          type="button"
          className="add-transaction-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      {/* Summary Cards */}
      <div className="summary-grid">
        {/* Total Income */}
        <div className="summary-card income-card">
          <div className="summary-icon income-icon">
            <TrendingUp size={22} />
          </div>

          <p>Total Income</p>
          <h2>{formatCurrency(summary.totalIncome)}</h2>
        </div>

        {/* Total Expenses */}
        <div className="summary-card expense-card">
          <div className="summary-icon expense-icon">
            <TrendingDown size={22} />
          </div>

          <p>Total Expenses</p>
          <h2>{formatCurrency(summary.totalExpenses)}</h2>
        </div>

        {/* Current Balance */}
        <div className="summary-card balance-card">
          <div className="summary-icon balance-icon">
            <Wallet size={22} />
          </div>

          <p>Current Balance</p>
          <h2>{formatCurrency(summary.balance)}</h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Monthly Chart */}
        <div className="dashboard-card">
          <h3>Monthly Income & Expenses</h3>

          {monthlyChartData.length === 0 ? (
            <p className="empty-message">No monthly data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip formatter={(value) => formatCurrency(value)} />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill="#e59b42"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Chart */}
        <div className="dashboard-card">
          <h3>Category-wise Expenses</h3>

          {categoryData.length === 0 ? (
            <p className="empty-message">No expense categories available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`${entry._id}-${index}`}
                      fill={
                        [
                          "#16a34a",
                          "#e59b42",
                          "#3b82f6",
                          "#a855f7",
                          "#ef4444",
                          "#14b8a6",
                        ][index % 6]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(value) => formatCurrency(value)} />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-card recent-card">
        <div className="recent-transactions-header">
          <h3>Recent Transactions</h3>

          <Link to="/transactions" className="view-all-link">
            View All Transactions →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="empty-message">No transactions available.</p>
        ) : (
          <div className="transaction-list">
            {recentTransactions.map((transaction) => (
              <div className="transaction-item" key={transaction._id}>
                <div className="transaction-details">
                  <h4>{transaction.category}</h4>

                  <p>
                    {transaction.paymentMethod} ·{" "}
                    {new Date(transaction.date).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div
                  className={
                    transaction.type === "income"
                      ? "transaction-amount income-text"
                      : "transaction-amount expense-text"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
}

export default Dashboard;
