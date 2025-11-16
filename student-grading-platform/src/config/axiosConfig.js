/**
 * Axios Configuration
 * 
 * Multiple axios instances for microservices architecture:
 * - identityAxios: Authentication service (Port 5000)
 * - academicAxios: Academic data service (Port 5002)
 * 
 * Each instance has interceptors for:
 * - Authentication headers
 * - Request/Response logging
 * - Error handling
 */

import axios from 'axios';
import { IDENTITY_SERVICE_URL, ACADEMIC_SERVICE_URL } from './api';

// Debug: Log service URLs
console.log('[AxiosConfig] IDENTITY_SERVICE_URL:', IDENTITY_SERVICE_URL);
console.log('[AxiosConfig] ACADEMIC_SERVICE_URL:', ACADEMIC_SERVICE_URL);

// Create request interceptor function (reusable)
const createRequestInterceptor = (serviceName) => (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${serviceName} Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
  }
  
  return config;
};

// Create response interceptor function (reusable)
const createResponseInterceptor = (serviceName) => ({
  onFulfilled: (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${serviceName} Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    // Extract data from different response formats:
    // 1. ApiResponse wrapper: { data: T, statusCode: number, message: string }
    // 2. OData response: { "@odata.context": "...", "value": [...] } or { "value": [...] }
    // 3. Direct data: [...] or { ... }
    
    // Check if it's an OData response (has 'value' property or '@odata.context')
    if (response.data && (response.data.value !== undefined || response.data['@odata.context'])) {
      return response.data; // Return full OData response to let service handle it
    }
    
    // Check if it's ApiResponse wrapper
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    
    // Return data as-is
    return response.data;
  },
  onRejected: (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${serviceName} Error]`, error.response?.data || error.message);
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Authentication error - please login again');
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
      console.error('No response from server');
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    } else {
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
});

// IdentityService axios instance (Port 5000)
const identityAxios = axios.create({
  baseURL: IDENTITY_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// AcademicService axios instance (Port 5002)
const academicAxios = axios.create({
  baseURL: ACADEMIC_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

console.log('[AxiosConfig] academicAxios.defaults.baseURL:', academicAxios.defaults.baseURL);
console.log('[AxiosConfig] identityAxios.defaults.baseURL:', identityAxios.defaults.baseURL);

// Add interceptors to IdentityService instance
identityAxios.interceptors.request.use(
  createRequestInterceptor('IdentityService'),
  (error) => {
    console.error('[IdentityService Request Error]', error);
    return Promise.reject(error);
  }
);

const identityResponseInterceptor = createResponseInterceptor('IdentityService');
identityAxios.interceptors.response.use(
  identityResponseInterceptor.onFulfilled,
  identityResponseInterceptor.onRejected
);

// Add interceptors to AcademicService instance
academicAxios.interceptors.request.use(
  createRequestInterceptor('AcademicService'),
  (error) => {
    console.error('[AcademicService Request Error]', error);
    return Promise.reject(error);
  }
);

const academicResponseInterceptor = createResponseInterceptor('AcademicService');
academicAxios.interceptors.response.use(
  academicResponseInterceptor.onFulfilled,
  academicResponseInterceptor.onRejected
);

// Export both instances
export { identityAxios, academicAxios };

// Default export for backward compatibility (use AcademicService as default since most features use it)
export default academicAxios;
