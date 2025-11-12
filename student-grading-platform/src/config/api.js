// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google-login`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/v1/auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/refresh-token`
  }
};

export const GOOGLE_CLIENT_ID = '16223097955-590qu6bf56773fj6one2s0pobbactglg.apps.googleusercontent.com';

export default API_BASE_URL;
