import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkMe = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMe();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      setUser(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please check credentials.';
      throw new Error(message);
    }
  };

  const register = async (registerData) => {
    try {
      await api.post('/api/auth/register', registerData);
      // Auto login
      return await login(registerData.username, registerData.password);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === 'string') {
          throw new Error(errorData);
        }
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        // Validation errors Map
        const messages = Object.entries(errorData)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        throw new Error(messages || 'Registration failed');
      }
      throw new Error('Registration failed. Please check input requirements.');
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
