import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved session on app start
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        
        if (savedToken && savedUser) {
          // Verify token with backend
          try {
            const res = await authAPI.me();
            // Update user data from server to ensure it's fresh
            setUser(res.data.user);
            setToken(savedToken);
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
          } catch (apiErr) {
            console.log('Session validation failed:', apiErr.message);
            await logout(); // Token expired or invalid
          }
        }
      } catch (err) {
        console.log('Session load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password);
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
