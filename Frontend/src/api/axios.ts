import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => {
    // Pass through successful responses
    return response;
  },
  (error) => {
    // Check if error is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear all auth data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("mitHealthUser");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/login";

      // Optionally show a message
      console.warn("Session expired. Please login again.");
    }

    // Reject the promise so calling code can still handle errors
    return Promise.reject(error);
  }
);

export default api;
