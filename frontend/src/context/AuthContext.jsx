
import { createContext, useState, useEffect } from 'react';

import API from '../services/api';

// Create Context
export const AuthContext = createContext();

// Create Provider
export const AuthProvider = ({ children }) => {

  // Store user information
  const [user, setUser] = useState(null);

  // Retrieve saved token
  const [token, setToken] = useState(
    localStorage.getItem('token')
  );

  // Track authentication restoration
  const [loading, setLoading] = useState(true);

  // Restore user when application starts
  useEffect(() => {

    const restoreUser = async () => {

      const savedToken = localStorage.getItem('token');

      // No token means user is logged out
      if (!savedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {

        // Verify token and retrieve user profile
        const response = await API.get('/auth/profile');

        setUser(response.data.user);
        setToken(savedToken);

      } catch (error) {

        console.error('Session restoration failed:', error);

        // Remove invalid or expired token
        localStorage.removeItem('token');

        setUser(null);
        setToken(null);

      } finally {

        setLoading(false);

      }
    };

    restoreUser();

  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
