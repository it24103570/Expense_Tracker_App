import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Change this to your machine's local IP when running on a physical device
// For Android emulator use: http://10.0.2.2:5000/api
// For iOS simulator use:    http://localhost:5000/api
// For physical device use:  http://YOUR_LOCAL_IP:5000/api  (e.g. http://192.168.1.5:5000/api)
import { API_URL } from '@env';
console.log('🔍 DEBUG: API_URL load from @env:', API_URL);

export const SERVER_URL = API_URL;
const BASE_URL = `${SERVER_URL}/api`;
console.log('🔍 DEBUG: BASE_URL initialized:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
};

// ─── Transactions ────────────────────────────────────────────────────────────
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: (params) => api.get('/transactions/summary', { params }),
  getStats: (params) => api.get('/transactions/stats', { params }),
  deleteAll: () => api.delete('/transactions/all'),
  getCategories: (params) => api.get('/transactions/categories', { params }),
  getReport: (params) => api.get('/transactions/report', { params }),
  getChart: (params) => api.get('/transactions/chart', { params }),
  getDailyActivity: (params) => api.get('/transactions/daily', { params }),
};

// ─── Budgets ─────────────────────────────────────────────────────────────────
export const budgetsAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  save: (category, limit) => api.post('/budgets', { category, limit }),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  updateProfile: (name, email) => api.put('/users/profile', { name, email }),
  changePassword: (currentPassword, newPassword) =>
    api.put('/users/password', { currentPassword, newPassword }),
  uploadAvatar: (formData) =>
    api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removeAvatar: () => api.delete('/users/avatar'),
};

export default api;
