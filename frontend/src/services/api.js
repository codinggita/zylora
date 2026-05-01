import axios from 'axios';
import store from '../store';
import { logout } from '../features/auth/authSlice';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
let backendUrlStr = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

if (!backendUrlStr) {
  backendUrlStr = isLocalhost ? 'http://127.0.0.1:5001/api' : 'https://zylora-e-commerce.onrender.com/api';
} else if (!backendUrlStr.endsWith('/api')) {
  backendUrlStr = `${backendUrlStr}/api`;
}

const api = axios.create({
  baseURL: backendUrlStr,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
