
import { useState } from 'react';
import API from '../services/api';

function Register() {

  // Store form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Store loading, success and error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {

      const response = await API.post(
        '/auth/register',
        formData
      );

      setSuccess(
        response.data.message || 'Registration successful!'
      );

      // Clear form after successful registration
      setFormData({
        name: '',
        email: '',
        password: ''
      });

    } catch (error) {

      setError(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div>

      <h1>Create Account</h1>

      <p>Register to start managing your expenses.</p>

      {/* Success Message */}
      {success && (
        <p style={{ color: 'green' }}>
          {success}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        {/* Name Input */}
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* Email Input */}
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Password Input */}
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        {/* Register Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

      </form>

    </div>
  );
}

export default Register;
