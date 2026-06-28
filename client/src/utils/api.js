import axios from 'axios';

// Base API endpoint configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add JWT headers
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

export const getBaseUrl = () => {
  return API_BASE_URL.replace('/api', '');
};

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const uploadsIndex = url.replace(/\\/g, '/').indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    const relativePath = url.replace(/\\/g, '/').substring(uploadsIndex);
    return `${getBaseUrl()}${relativePath}`;
  }
  
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${getBaseUrl()}${cleanPath}`;
};

export default api;
