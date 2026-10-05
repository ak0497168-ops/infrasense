import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, adminAPI } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('infrasense_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.data) {
            setUser(res.data.data);
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('infrasense_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const adminLogin = async (email, password) => {
    const res = await adminAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('infrasense_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('infrasense_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const quickDemoLogin = async () => {
    return await login('anuv@example.com', 'password123');
  };

  const quickDemoAdminLogin = async () => {
    try {
      return await adminLogin('admin@gamil.com', 'admin@1234');
    } catch {
      return await adminLogin('admin@gmail.com', 'admin@1234');
    }
  };

  const logout = () => {
    localStorage.removeItem('infrasense_token');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (prefs) => {
    const res = await authAPI.updatePreferences(prefs);
    if (res.data && res.data.data) {
      setUser((prev) => ({
        ...prev,
        notificationPreferences: res.data.data.notificationPreferences,
      }));
    }
    return res.data.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        adminLogin,
        register,
        quickDemoLogin,
        quickDemoAdminLogin,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
