// frontend/src/services/api.ts - JAVÍTOTT TOKEN KERESÉS
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Helper function: token keresése mindkét storage-ból
const getAuthToken = (): string | null => {
  // Először localStorage-ból próbáljuk (ha remember me volt)
  let token = localStorage.getItem('authToken');
  if (token) {
    return token;
  }
  
  // Ha nincs localStorage-ban, sessionStorage-ból
  return sessionStorage.getItem('authToken');
};

// Request interceptor - JAVÍTOTT
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();  // ✅ Használjuk a helper function-t
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - JAVÍTOTT
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ Mindkét storage-ból töröljük a token-t
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      // Redirect login-ra
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;