import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://releif-mesh1.onrender.com/api';
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      // Prevent infinite redirect loops if we are already on an auth page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
};

// Resource APIs
export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Help Request APIs
export const helpRequestAPI = {
  getAll: (params) => api.get('/help-requests', { params }),
  create: (data) => api.post('/help-requests', data),
  update: (id, data) => api.put(`/help-requests/${id}`, data),
  delete: (id) => api.delete(`/help-requests/${id}`),
};

// Shelter APIs
export const shelterAPI = {
  getAll: (params) => api.get('/shelters', { params }),
  create: (data) => api.post('/shelters', data),
  update: (id, data) => api.put(`/shelters/${id}`, data),
  delete: (id) => api.delete(`/shelters/${id}`),
};

// Stats API
export const statsAPI = {
  get: () => api.get('/stats'),
};

export default api;
