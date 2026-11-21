import { useState, useEffect } from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import API from "../services/api";
import "./Budget.css";

function Budget() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryLimit, setCategoryLimit] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };
  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/budgets/summary", {
        params: {
          month: selectedMonth + 1,
          year: selectedYear,
        },
      });

      setBudgetData(response.data);
    } catch (error) {
      console.error("Error fetching budget data:", error);

      setError(error.response?.data?.message || "Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBudgetData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (budgetData?.budget?.totalBudget !== undefined) {
      setBudgetAmount(budgetData.budget.totalBudget);
    } else {
      setBudgetAmount("");
    }
  }, [budgetData]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();

    if (!budgetAmount || Number(budgetAmount) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    try {
      setSavingBudget(true);
      setError("");
      setSuccessMessage("");

      const response = await API.post("/budgets", {
        month: selectedMonth + 1,
        year: selectedYear,
        totalBudget: Number(budgetAmount),
        categoryBudgets: budgetData?.budget?.categoryBudgets || [],
      });

      setSuccessMessage(response.data.message || "Budget saved successfully!");

      await fetchBudgetData();
    } catch (error) {
      console.error("Error saving budget:", error);

      setError(error.response?.data?.message || "Failed to save budget.");
    } finally {
      setSavingBudget(false);
    }
  };
  const handleAddCategoryBudget = async (e) => {
    e.preventDefault();

    if (!categoryName || !categoryLimit || Number(categoryLimit) <= 0) {
      setError("Please select a category and enter a valid limit.");
      return;
    }

    try {
      setSavingCategory(true);
      setError("");
      setSuccessMessage("");

      const existingCategories = budgetData?.budget?.categoryBudgets || [];

      const updatedCategories = [
        ...existingCategories.filter((item) => item.category !== categoryName),
        {
          category: categoryName,
          limit: Number(categoryLimit),
        },
      ];

      await API.post("/budgets", {
        month: selectedMonth + 1,
        year: selectedYear,
        totalBudget: budgetData?.budget?.totalBudget || 0,
        categoryBudgets: updatedCategories,
      });

      setSuccessMessage(
        editingCategory
          ? "Category budget saved successfully!"
          : "Category budget saved successfully!",
      );

      setCategoryName("");
      setCategoryLimit("");
      setEditingCategory(null);

      await fetchBudgetData();
    } catch (error) {
      console.error("Error saving category budget:", error);

      setError(
        error.response?.data?.message || "Failed to save category budget.",
      );
    } finally {
      setSavingCategory(false);
    }
  };
  const handleEditCategory = (category) => {
    setCategoryName(category.category);
    setCategoryLimit(category.limit);
    setEditingCategory(category.category);

    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="budget-page">
      {/* Page Header */}
      <div className="budget-header">
        <div>
          <h1>Budget Management</h1>
          <p>Plan your budget and keep track of your spending.</p>
        </div>

        {/* Month Selector */}
        <div className="budget-month-selector">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="month-nav-btn"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="selected-month">
            <CalendarDays size={18} />
            <span>
              {monthNames[selectedMonth]} {selectedYear}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="month-nav-btn"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      {loading && <div className="budget-loading">Loading budget data...</div>}

      {error && <div className="budget-error">{error}</div>}

      {/* Budget Overview */}
      <div className="budget-overview">
        {/* Total Budget */}
        <div className="budget-card total-card">
          <div className="budget-card-header">
            <div className="budget-card-icon budget-icon-total">
              <Wallet size={22} />
            </div>
          </div>

          <p className="budget-card-label">Total Budget</p>
          <h2>
            ₹{budgetData?.budget?.totalBudget?.toLocaleString("en-IN") || 0}
          </h2>
          <p className="budget-card-description">Your monthly spending limit</p>
        </div>

        {/* Total Spent */}
        <div className="budget-card spent-card">
          <div className="budget-card-header">
            <div className="budget-card-icon budget-icon-spent">
              <TrendingDown size={22} />
            </div>
          </div>

          <p className="budget-card-label">Total Spent</p>
          <h2>₹{budgetData?.totalSpent?.toLocaleString("en-IN") || 0}</h2>
          <p className="budget-card-description">Amount spent this month</p>
        </div>

        {/* Remaining Budget */}
        <div className="budget-card remaining-card">
          <div className="budget-card-header">
            <div className="budget-card-icon budget-icon-remaining">
              <TrendingUp size={22} />
            </div>
          </div>

          <p className="budget-card-label">Remaining Budget</p>
          <h2>₹{budgetData?.remainingBudget?.toLocaleString("en-IN") || 0}</h2>
          <p className="budget-card-description">Available spending balance</p>
        </div>
      </div>

      {/* Budget Content */}
      <div className="budget-content">
        <div className="budget-section">
          <h2>Monthly Budget</h2>
          <p>Set your total monthly spending limit.</p>

          <form onSubmit={handleSaveBudget} className="monthly-budget-form">
            <div className="budget-input-group">
              <label htmlFor="monthlyBudget">Monthly Spending Limit</label>

              <div className="budget-input-wrapper">
                <span className="currency-symbol">₹</span>

                <input
                  type="number"
                  id="monthlyBudget"
                  value={budgetAmount}
                  onChange={(e) => {
                    setBudgetAmount(e.target.value);
                    setSuccessMessage("");
                    setError("");
                  }}
                  placeholder="Enter your monthly budget"
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="save-budget-btn"
              disabled={savingBudget}
            >
              {savingBudget ? "Saving..." : "Save Monthly Budget"}
            </button>

            {successMessage && (
              <div className="budget-success">{successMessage}</div>
            )}
          </form>
        </div>

        <div className="budget-section">
          <h2>Category Budgets</h2>
          <p>Manage spending limits for individual categories.</p>

          <div className="category-budget-container">
            {/* Add Category Budget Form */}
            <form
              onSubmit={handleAddCategoryBudget}
              className="category-budget-form"
            >
              <div className="category-input-group">
                <label htmlFor="categoryName">Category</label>

                <select
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    setCategoryLimit("");
                    setError("");
                  }}
                  disabled={!!editingCategory}
                >
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Games">Games</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="category-input-group">
                <label htmlFor="categoryLimit">Budget Limit</label>

                <div className="category-limit-input">
                  <span>₹</span>

                  <input
                    type="number"
                    id="categoryLimit"
                    value={categoryLimit}
                    onChange={(e) => setCategoryLimit(e.target.value)}
                    placeholder="Enter limit"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="category-form-actions">
                <button
                  type="submit"
                  className="save-category-btn"
                  disabled={savingCategory}
                >
                  {savingCategory
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Add Category"}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    className="cancel-category-btn"
                    onClick={() => {
                      setCategoryName("");
                      setCategoryLimit("");
                      setEditingCategory(null);
                      setError("");
                      setSuccessMessage("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Category Budget List */}
            <div className="category-budget-list">
              {budgetData?.budget?.categoryBudgets?.length > 0 ? (
                budgetData.budget.categoryBudgets.map((category) => {
                  const spent =
                    budgetData.categorySpending?.[category.category] || 0;

                  const percentage =
                    category.limit > 0
                      ? Math.min((spent / category.limit) * 100, 100)
                      : 0;

                  const exceeded = spent > category.limit;

                  const remaining = category.limit - spent;

                  return (
                    <div
                      className="category-budget-card"
                      key={category._id || category.category}
                    >
                      <div className="category-budget-top">
                        <div>
                          <h3>{category.category}</h3>

                          <p>
                            ₹{spent.toLocaleString("en-IN")} spent of ₹
                            {category.limit.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="category-card-actions">
                          <button
                            type="button"
                            className="edit-category-btn"
                            onClick={() => handleEditCategory(category)}
                          >
                            Edit
                          </button>
                        </div>

                        <div className="category-budget-amount">
                          <strong>
                            ₹{category.limit.toLocaleString("en-IN")}
                          </strong>

                          <span>Limit</span>
                        </div>
                      </div>

                      <div className="category-progress-track">
                        <div
                          className={`category-progress-fill ${
                            exceeded ? "progress-exceeded" : ""
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="category-budget-bottom">
                        <span>{Math.round(percentage)}% used</span>

                        <span
                          className={exceeded ? "category-over-budget" : ""}
                        >
                          {exceeded
                            ? `₹${Math.abs(remaining).toLocaleString("en-IN")} over budget`
                            : `₹${remaining.toLocaleString("en-IN")} remaining`}
                        </span>
                      </div>

                      {exceeded && (
                        <div className="category-budget-warning">
                          You have exceeded this category's budget.
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="category-empty-state">
                  <p>No category budgets have been set yet.</p>
                  <span>Add your first category budget above.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Budget;
