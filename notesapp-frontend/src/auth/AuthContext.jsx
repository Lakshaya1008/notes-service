import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setToken, removeToken, getUserFromToken } from './authUtils';
import authApi from '../api/authApi';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  // Initialize user from stored token on mount
  // Token expiry is checked once here; subsequent expiry is handled via 401 responses
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = getUserFromToken();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const token = await authApi.login(email, password);
    setToken(token);
    const userData = getUserFromToken();
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (email, password, inviteCode) => {
    const token = await authApi.register(email, password, inviteCode);
    setToken(token);
    const userData = getUserFromToken();
    setUser(userData);
    return userData;
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === ROLES.ADMIN;

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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
