// API Configuration
const IDENTITY_API = process.env.REACT_APP_IDENTITY_API || 'http://localhost:5000';
const ACADEMIC_API = process.env.REACT_APP_ACADEMIC_API || 'http://localhost:5002';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${IDENTITY_API}/api/v1/auth/google-login`,
    REFRESH_TOKEN: `${IDENTITY_API}/api/v1/auth/refresh-token`,
    LOGOUT: `${IDENTITY_API}/api/v1/auth/refresh-token`
  },
  SEMESTERS: {
    GET_ALL: `${ACADEMIC_API}/api/v1/Semesters`,
    GET_BY_ID: (id) => `${ACADEMIC_API}/api/v1/Semesters/${id}`,
    CREATE: `${ACADEMIC_API}/api/v1/Semesters`,
    UPDATE: (id) => `${ACADEMIC_API}/api/v1/Semesters/${id}`,
    DELETE: (id) => `${ACADEMIC_API}/api/v1/Semesters/${id}`
  },
  SUBJECTS: {
    GET_ALL: `${ACADEMIC_API}/api/v1/Subjects`,
    GET_BY_ID: (id) => `${ACADEMIC_API}/api/v1/Subjects/${id}`,
    CREATE: `${ACADEMIC_API}/api/v1/Subjects`,
    UPDATE: (id) => `${ACADEMIC_API}/api/v1/Subjects/${id}`,
    DELETE: (id) => `${ACADEMIC_API}/api/v1/Subjects/${id}`
  },
  EXAMS: {
    GET_ALL: `${ACADEMIC_API}/api/v1/Exams`,
    GET_BY_ID: (id) => `${ACADEMIC_API}/api/v1/Exams/${id}`,
    CREATE: `${ACADEMIC_API}/api/v1/Exams`,
    UPDATE: (id) => `${ACADEMIC_API}/api/v1/Exams/${id}`,
    DELETE: (id) => `${ACADEMIC_API}/api/v1/Exams/${id}`
  },
  CRITERIA: {
    GET_ALL: `${ACADEMIC_API}/api/v1/criterias`,
    QUERY: `${ACADEMIC_API}/api/v1/criterias/query`,
    GET_BY_ID: (id) => `${ACADEMIC_API}/api/v1/criterias/${id}`,
    CREATE: `${ACADEMIC_API}/api/v1/criterias`,
    UPDATE: (id) => `${ACADEMIC_API}/api/v1/criterias/${id}`,
    DELETE: (id) => `${ACADEMIC_API}/api/v1/criterias/${id}`
  },
  USERS: {
    GET_ALL: `${IDENTITY_API}/api/v1/Users`,
    GET_TEACHERS: `${IDENTITY_API}/api/v1/Users/teachers`,
    GET_BY_ID: (id) => `${IDENTITY_API}/api/v1/Users/${id}`
  },
  FILES: {
    EXTRACT_RAR: `${ACADEMIC_API}/api/v1/Files/extract-rar`,
    IMPORT_STUDENT: `${ACADEMIC_API}/api/v1/Files/import-student`,
    IMPORT_CRITERIA: `${ACADEMIC_API}/api/v1/Files/import-criteria`
  },
  SUBMISSIONS: {
    GET_ALL: `${ACADEMIC_API}/api/v1/Submissions`,
    GET_BY_ID: (id) => `${ACADEMIC_API}/api/v1/Submissions/${id}`
  },
  VIOLATIONS: {
    GET_ALL: `${ACADEMIC_API}/api/v1/violation`,
    GET_BY_ID: `${ACADEMIC_API}/api/v1/violation`,
    UPDATE: `${ACADEMIC_API}/api/v1/violation`,
    DELETE: `${ACADEMIC_API}/api/v1/violation`
  }
};

export const API_BASE_URL = IDENTITY_API;

export const GOOGLE_CLIENT_ID = '16223097955-590qu6bf56773fj6one2s0pobbactglg.apps.googleusercontent.com';

export default API_BASE_URL;
