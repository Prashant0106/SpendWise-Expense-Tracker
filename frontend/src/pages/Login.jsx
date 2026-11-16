
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import {
  Wallet,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

// Animation settings
const panelVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' }
  }
};

const formVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Existing login functionality
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await API.post('/auth/login', formData);

      const { token, user } = response.data;

      localStorage.setItem('token', token);

      setToken(token);
      setUser(user);

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* Left Branding Panel */}
      <motion.div
        className="auth-brand-panel"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="brand-logo"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="brand-icon"
            whileHover={{ rotate: 15, scale: 1.1 }}
          >
            <Wallet size={25} />
          </motion.div>
          <span>SpendWise</span>
        </motion.div>

        <div className="brand-content">

          <motion.div
            className="brand-tagline"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <TrendingUp size={18} />
            <span>Take control of your finances</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            Manage your money.
            <br />
            <span>Build your future.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            Track your income, manage expenses, and understand
            where your money goes — all in one place.
          </motion.p>

          <motion.div
            className="brand-features"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.7
                }
              }
            }}
          >
            {[
              'Track income and expenses',
              'Monitor your monthly budget',
              'Understand your spending habits'
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <span className="feature-check">✓</span>
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="brand-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Your finances, made simpler.
        </motion.div>
      </motion.div>

      {/* Right Login Panel */}
      <motion.div
        className="auth-form-panel"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="login-form-wrapper"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.5
              }
            }
          }}
        >

          <motion.div className="mobile-brand" variants={itemVariants}>
            <Wallet size={24} />
            <span>SpendWise</span>
          </motion.div>

          <motion.div className="form-heading" variants={itemVariants}>
            <span className="welcome-label">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your dashboard.</p>
          </motion.div>

          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit}>

            <motion.div className="form-group" variants={itemVariants}>
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
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <LockKeyhole size={19} className="input-icon" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="login-button"
              disabled={loading}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={19} />}
            </motion.button>

          </motion.form>

          <motion.div className="auth-switch" variants={itemVariants}>
            Don't have an account?
            <Link to="/register">Create an account</Link>
          </motion.div>

          <motion.div className="form-bottom" variants={itemVariants}>
            Secure login powered by SpendWise
          </motion.div>

        </motion.div>
      </motion.div>

    </div>
  );
}

export default Login;
