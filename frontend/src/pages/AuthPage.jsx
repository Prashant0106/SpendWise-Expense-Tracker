import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import {
  Wallet,
  Mail,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./AuthPage.css";

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(
    location.pathname === "/register",
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { setUser, setToken } = useContext(AuthContext);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Switch between Login and Registration
  const switchMode = (registerMode) => {
    setIsRegister(registerMode);
    setError("");
    setSuccess("");
    setShowPassword(false);

    setFormData({
      name: "",
      email: "",
      password: "",
    });

    navigate(registerMode ? "/register" : "/login", {
      replace: true,
    });
  };

  // Handle both form submissions
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isRegister) {
        const response = await API.post("/auth/register", formData);

        setSuccess(response.data.message || "Registration successful!");

        setFormData({
          name: "",
          email: "",
          password: "",
        });
      } else {
        const response = await API.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);

        setToken(token);
        setUser(user);

        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `${isRegister ? "Registration" : "Login"} failed. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${isRegister ? "register-mode" : "login-mode"}`}>
      {/* Animated Background */}
      <motion.div
        className="auth-slider"
        animate={{
          x: isRegister ? "100%" : "0%",
        }}
        transition={{
          duration: 0.8,
          ease: [0.65, 0, 0.35, 1],
        }}
      />

      {/* Branding Section */}
      <motion.div
        className="auth-brand"
        animate={{
          x: isRegister ? "100%" : "0%",
        }}
        transition={{
          duration: 0.8,
          ease: [0.65, 0, 0.35, 1],
        }}
      >
        <motion.div
          className="auth-brand-content"
          key={isRegister ? "register-brand" : "login-brand"}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="auth-logo">
            <Wallet size={30} />
            <span>SpendWise</span>
          </div>

          <h1>{isRegister ? "Welcome Back!" : "Manage your money."}</h1>

          <p>
            {isRegister
              ? "Already have an account? Sign in and continue your financial journey."
              : "Track your income, manage expenses, and build a better financial future."}
          </p>

          <button
            type="button"
            className="switch-button"
            onClick={() => switchMode(!isRegister)}
          >
            {isRegister ? "Sign In" : "Create Account"}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </motion.div>

      {/* Form Section */}

      <motion.div
        className="auth-form-area"
        animate={{
          x: isRegister ? "-100%" : "0%",
        }}
        transition={{
          duration: 0.8,
          ease: [0.65, 0, 0.35, 1],
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            className="auth-form-content"
            key={isRegister ? "register-form" : "login-form"}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="form-heading">
              <span className="welcome-label">
                {isRegister ? "GET STARTED" : "WELCOME BACK"}
              </span>

              <h2>
                {isRegister ? "Create your account" : "Sign in to your account"}
              </h2>

              <p>
                {isRegister
                  ? "Enter your details to get started."
                  : "Enter your details to access your dashboard."}
              </p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>

                  <div className="input-wrapper">
                    <User size={19} className="input-icon" />

                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <div className="input-wrapper">
                  <Mail size={19} className="input-icon" />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="input-wrapper">
                  <LockKeyhole size={19} className="input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={isRegister ? 8 : undefined}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? isRegister
                    ? "Creating account..."
                    : "Signing in..."
                  : isRegister
                    ? "Create Account"
                    : "Sign In"}

                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="mobile-switch">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}

              <button type="button" onClick={() => switchMode(!isRegister)}>
                {isRegister ? "Sign In" : "Register"}
              </button>
            </div>

            <div className="form-bottom">
              Secure authentication powered by SpendWise
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AuthPage;
