import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach JWT token to every request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response & error handling
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    // Auto logout on auth failure
    if (status === 401 || status === 403) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(
      new Error(
        error.response?.data?.message ||
        error.message ||
        'Something went wrong'
      )
    );
  }
);

export default api;
