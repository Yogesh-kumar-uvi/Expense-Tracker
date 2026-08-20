// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch (e) {
        // If me fails, clear user state
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    await api.post('/auth/login', { email, password });
    const { data: meData } = await api.get('/auth/me');
    setUser(meData.data);
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
    await login(userData.email, userData.password);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    // Not needed; access token is refreshed automatically via cookies.
    // Keep as no-op or call me to update user info if desired.
    const { data } = await api.get('/auth/me');
    setUser(data.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};