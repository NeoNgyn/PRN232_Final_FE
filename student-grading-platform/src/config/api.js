// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/v1/auth/google-login`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/v1/auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/refresh-token`
  },
  CRITERIA: {
    GET_ALL: `${API_BASE_URL}/api/v1/criterias`,
    QUERY: `${API_BASE_URL}/api/v1/criterias/query`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/v1/criterias/${id}`,
    CREATE: `${API_BASE_URL}/api/v1/criterias`,
    UPDATE: (id) => `${API_BASE_URL}/api/v1/criterias/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/v1/criterias/${id}`
  }
};

export const GOOGLE_CLIENT_ID = '16223097955-590qu6bf56773fj6one2s0pobbactglg.apps.googleusercontent.com';

export default API_BASE_URL;
