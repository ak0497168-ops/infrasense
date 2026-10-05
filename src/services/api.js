import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT Bearer Token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('infrasense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on auth page, we can clear token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // preserve state or redirect gracefully
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (prefs) => api.patch('/auth/preferences', prefs),
};

export const reportsAPI = {
  create: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMy: (params) => api.get('/reports/my', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  analyzeImage: (id, data) => api.post(`/reports/${id}/analyze-image`, data),
  previewAnalyze: (data) => api.post('/reports/preview-analyze', data),
  submitFeedback: (id, feedback) => api.post(`/reports/${id}/feedback`, feedback),
  advanceStatus: (id, nextStatus) => api.post(`/reports/${id}/advance-status`, { nextStatus }),
};

export const insightsAPI = {
  getOverview: () => api.get('/insights/overview'),
  getTrends: () => api.get('/insights/trends'),
  getEnvironment: () => api.get('/insights/environment'),
  getCommunity: () => api.get('/insights/community'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: (params) => api.get('/admin/reports', { params }),
  getReportById: (id) => api.get(`/admin/reports/${id}`),
  updateStatus: (id, data) => api.patch(`/admin/reports/${id}/status`, data),
  addNote: (id, note) => api.post(`/admin/reports/${id}/notes`, { note }),
  scheduleMaintenance: (id, data) => api.post(`/admin/reports/${id}/schedule`, data),
  resolveReport: (id, data) => api.post(`/admin/reports/${id}/resolve`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getInfrastructure: () => api.get('/admin/infrastructure'),
  getUsers: () => api.get('/admin/users'),
  getNotifications: () => api.get('/admin/notifications'),
};

export default api;
