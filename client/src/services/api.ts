import axios from 'axios';

// Determine API base URL based on how the app is accessed
function getApiBaseUrl(): string {
  // Priority 1: Use VITE_API_URL if defined (for production deployment with separate backend)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: In production build, check if we're on Render or similar
  // If hostname contains 'onrender.com', we're on Render and need to use VITE_API_URL
  const hostname = window.location.hostname;
  if (import.meta.env.MODE === 'production' && hostname.includes('onrender.com')) {
    // If VITE_API_URL is not set, this will fail - it should be set in Render
    console.warn('⚠️ VITE_API_URL is not set. Please set it in Render environment variables.');
    return '/api'; // Fallback, but this won't work on Render
  }
  
  // Priority 3: In production but not on Render (local production build)
  if (import.meta.env.MODE === 'production') {
    return '/api';
  }
  
  // Priority 4: Development - use proxy for localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api';
  }
  
  // Priority 5: Development - network IP access
  return `http://${hostname}:5000/api`;
}

// Get base URL for static files (uploads)
function getUploadsBaseUrl(): string {
  // If VITE_API_URL is set, extract the base URL (without /api)
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    // Remove /api from the end if present
    return apiUrl.replace(/\/api\/?$/, '');
  }
  
  // In production, use relative path
  if (import.meta.env.MODE === 'production') {
    return '';
  }
  
  // Development
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return `http://${hostname}:5000`;
}

const API_BASE_URL = getApiBaseUrl();
export const UPLOADS_BASE_URL = getUploadsBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and connection errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Connection errors
    if (!error.response) {
      console.error('Network error:', error.message);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.message = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.';
      }
    }

    // Authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
