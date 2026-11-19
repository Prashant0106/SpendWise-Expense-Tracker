import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  LogOut,
  Menu,
  X,
  UserRound,
  PiggyBank,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar
          ${collapsed ? "sidebar-collapsed" : ""}
          ${mobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        {/* Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Wallet size={23} />
            </div>

            {!collapsed && <h2>SpendWise</h2>}
          </div>

          <button
            type="button"
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Main Menu */}
        <div className="sidebar-menu">
          {!collapsed && <p className="sidebar-label">MAIN MENU</p>}

          <NavLink
            to="/dashboard"
            title="Dashboard"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={20} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/transactions"
            title="Transactions"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Receipt size={20} />
            {!collapsed && <span>Transactions</span>}
          </NavLink>

          <NavLink
            to="/budget"
            title="Budget"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <PiggyBank size={20} />
            {!collapsed && <span>Budget</span>}
          </NavLink>

          <NavLink
            to="/profile"
            title="Profile"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <UserRound size={20} />
            {!collapsed && <span>Profile</span>}
          </NavLink>
        </div>

        {/* Logout */}
        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
