// API Configuration - Multiple Microservices
// IdentityService: Authentication (Google Login, JWT, etc.)
const IDENTITY_SERVICE_URL = process.env.REACT_APP_IDENTITY_SERVICE_URL || 'http://localhost:5000';

// AcademicService: Subjects, Semesters, Criteria, etc.
const ACADEMIC_SERVICE_URL = process.env.REACT_APP_ACADEMIC_SERVICE_URL || 'http://localhost:5002';

export const API_ENDPOINTS = {
  // IdentityService endpoints (Port 5001)
  AUTH: {
    GOOGLE_LOGIN: `${IDENTITY_SERVICE_URL}/api/v1/auth/google-login`,
    REFRESH_TOKEN: `${IDENTITY_SERVICE_URL}/api/v1/auth/refresh-token`,
    LOGOUT: `${IDENTITY_SERVICE_URL}/api/v1/auth/logout`
  },
  
  USERS: {
    GET_ALL: `${IDENTITY_SERVICE_URL}/api/v1/users`,
    GET_TEACHERS: `${IDENTITY_SERVICE_URL}/api/v1/users/teachers`,
    GET_BY_ID: (id) => `${IDENTITY_SERVICE_URL}/api/v1/users/${id}`,
    CREATE: `${IDENTITY_SERVICE_URL}/api/v1/users`,
    UPDATE: (id) => `${IDENTITY_SERVICE_URL}/api/v1/users/${id}`,
    DELETE: (id) => `${IDENTITY_SERVICE_URL}/api/v1/users/${id}`
  },
  
  // AcademicService endpoints (Port 5003)
  CRITERIA: {
    GET_ALL: `${ACADEMIC_SERVICE_URL}/api/v1/criteria`,
    QUERY: `${ACADEMIC_SERVICE_URL}/api/v1/criteria/query`,
    GET_BY_ID: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/criteria/${id}`,
    CREATE: `${ACADEMIC_SERVICE_URL}/api/v1/criteria`,
    UPDATE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/criteria/${id}/update`,
    DELETE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/criteria/${id}/delete`
  },
  SUBJECTS: {
    GET_ALL: `${ACADEMIC_SERVICE_URL}/api/v1/subjects`,
    GET_BY_ID: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/subjects/${id}`,
    CREATE: `${ACADEMIC_SERVICE_URL}/api/v1/subjects`,
    UPDATE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/subjects/${id}`,
    DELETE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/subjects/${id}`
  },
  SEMESTERS: {
    GET_ALL: `${ACADEMIC_SERVICE_URL}/api/v1/semesters`,
    GET_BY_ID: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/semesters/${id}`,
    CREATE: `${ACADEMIC_SERVICE_URL}/api/v1/semesters`,
    UPDATE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/semesters/${id}`,
    DELETE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/semesters/${id}`
  },
  EXAMS: {
    GET_ALL: `${ACADEMIC_SERVICE_URL}/api/v1/exams`,
    GET_BY_ID: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/exams/${id}`,
    CREATE: `${ACADEMIC_SERVICE_URL}/api/v1/exams`,
    UPDATE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/exams/${id}`,
    DELETE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/exams/${id}`
  },
  SUBMISSIONS: {
    GET_ALL: `${ACADEMIC_SERVICE_URL}/api/v1/submission`,
    QUERY: `${ACADEMIC_SERVICE_URL}/api/v1/submission/query`,
    GET_BY_ID: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/submission/${id}`,
    CREATE: `${ACADEMIC_SERVICE_URL}/api/v1/submission`,
    UPDATE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/submission/${id}/update`,
    DELETE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/submission/${id}/delete`
  },
  VIOLATIONS: {
    GET_ALL: `${ACADEMIC_SERVICE_URL}/api/v1/violation`,
    GET_BY_ID: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/violation/${id}`,
    CREATE: `${ACADEMIC_SERVICE_URL}/api/v1/violation`,
    UPDATE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/violation/${id}/update`,
    DELETE: (id) => `${ACADEMIC_SERVICE_URL}/api/v1/violation/${id}/delete`
  },
  FILES: {
    IMPORT_STUDENTS: `${ACADEMIC_SERVICE_URL}/api/v1/files/import-student`,
    IMPORT_CRITERIA: `${ACADEMIC_SERVICE_URL}/api/v1/files/import-criteria`,
    EXTRACT_RAR: `${ACADEMIC_SERVICE_URL}/api/v1/files/extract-rar`,
    GET_FILE_URL: (filePath) => `${ACADEMIC_SERVICE_URL}/api/v1/files/${encodeURIComponent(filePath)}`
  }
};

export const API_BASE_URL = IDENTITY_SERVICE_URL;

export const GOOGLE_CLIENT_ID = '16223097955-590qu6bf56773fj6one2s0pobbactglg.apps.googleusercontent.com';

// Export service URLs for direct access if needed
export { IDENTITY_SERVICE_URL, ACADEMIC_SERVICE_URL };

// Legacy export for backward compatibility
export default IDENTITY_SERVICE_URL;
