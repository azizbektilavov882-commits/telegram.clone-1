import axios from 'axios';

// Base API configuration - use relative path when served from same port
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Users API
export const usersAPI = {
  search: (query) => api.get(`/api/users/search?query=${encodeURIComponent(query)}`),
  getProfile: (userId) => api.get(`/api/users/${userId}`),
  updateProfile: (data) => api.put('/api/users/profile', data),
  uploadAvatar: (formData) => api.post('/api/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getContacts: () => api.get('/api/users/contacts'),
  addContact: (userId) => api.post(`/api/users/contacts/${userId}`),
  removeContact: (userId) => api.delete(`/api/users/contacts/${userId}`),
};

// Chat API
export const chatAPI = {
  getChats: () => api.get('/api/chat'),
  createChat: (data) => api.post('/api/chat/create', data),
  getMessages: (chatId, page = 1, limit = 50) =>
    api.get(`/api/chat/${chatId}/messages?page=${page}&limit=${limit}`),
  sendMessage: (chatId, data) => api.post(`/api/chat/${chatId}/messages`, data),
  editMessage: (chatId, messageId, data) =>
    api.put(`/api/chat/${chatId}/messages/${messageId}`, data),
  deleteMessage: (chatId, messageId) =>
    api.delete(`/api/chat/${chatId}/messages/${messageId}`),
  markAsRead: (chatId, messageId) =>
    api.put(`/api/chat/${chatId}/messages/${messageId}/read`),
  searchMessages: (query) =>
    api.get(`/api/chat/search?query=${encodeURIComponent(query)}`),
  uploadFile: (chatId, formData) =>
    api.post(`/api/chat/${chatId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Groups API
export const groupsAPI = {
  createGroup: (data) => api.post('/api/groups', data),
  getGroup: (groupId) => api.get(`/api/groups/${groupId}`),
  updateGroup: (groupId, data) => api.put(`/api/groups/${groupId}`, data),
  deleteGroup: (groupId) => api.delete(`/api/groups/${groupId}`),
  addMember: (groupId, userId) => api.post(`/api/groups/${groupId}/members/${userId}`),
  removeMember: (groupId, userId) => api.delete(`/api/groups/${groupId}/members/${userId}`),
  updateMemberRole: (groupId, userId, role) =>
    api.put(`/api/groups/${groupId}/members/${userId}/role`, { role }),
  leaveGroup: (groupId) => api.post(`/api/groups/${groupId}/leave`),
};

export default api;