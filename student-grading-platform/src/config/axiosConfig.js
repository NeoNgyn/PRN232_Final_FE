/**
 * Axios Configuration
 * 
 * Centralized axios instance with interceptors for:
 * - Authentication headers
 * - Request/Response logging
 * - Error handling
 * - Token refresh logic (if needed)
 */

import axios from 'axios';
import API_BASE_URL from './api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    // Extract data from ApiResponse wrapper
    // Backend returns: { data: T, statusCode: number, message: string }
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Response Error]', error.response?.data || error.message);
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.error('Authentication error - please login again');
          // TODO: Implement token refresh or redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error ${status}: ${data?.message || error.message}`);
      }
      
      return Promise.reject(new Error(data?.message || error.message));
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server');
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
