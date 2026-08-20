// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  withCredentials: true
});

// Do NOT read JWT from localStorage.
// Authentication is handled through HTTP-only cookies.

// Handle unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;