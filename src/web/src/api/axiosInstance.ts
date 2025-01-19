import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * Custom Axios instance for API requests
 * Configured with base URL and default headers
 */
const axiosInstance = axios.create({
  // Use environment variable for API URL, fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  // Set default headers
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Adds authentication token to requests if available
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = Cookies.get('token');

    // Add token to Authorization header if present
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add ngrok-skip-browser-warning header
    config.headers['ngrok-skip-browser-warning'] = 'true';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common response scenarios and errors
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login page
      //window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
