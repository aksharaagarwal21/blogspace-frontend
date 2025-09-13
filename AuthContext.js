import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // API Base URL - KEEP AS ORIGINAL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    console.log('🔧 AuthProvider initialized with API_BASE_URL:', API_BASE_URL);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    console.log('🔧 Login attempt with:', { email: credentials.email });
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔧 Login response:', response.data);
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (error) {
      console.error('🔧 Login error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const { user: newUser, token } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully! 👋');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};






