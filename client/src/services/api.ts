import axios from 'axios';

// Determine API base URL based on how the app is accessed
function getApiBaseUrl(): string {
  // If running in dev with explicit API URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If accessing via localhost, use the proxy
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api';
  }
  
  // If accessing via network IP, connect directly to backend on same IP
  // Backend runs on port 5000
  return `http://${hostname}:5000/api`;
}

// Get base URL for static files (uploads)
function getUploadsBaseUrl(): string {
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
