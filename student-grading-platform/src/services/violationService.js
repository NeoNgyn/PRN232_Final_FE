import { academicAxios } from '../config/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

const violationService = {
  // Get all violations
  getAllViolations: async () => {
    try {
      const response = await academicAxios.get(API_ENDPOINTS.VIOLATIONS.GET_ALL);
      const violations = response.data?.data || [];
      return violations.map(violation => ({
        id: violation.violationId,
        submissionId: violation.submissionId,
        type: violation.type,
        description: violation.description,
        penalty: violation.penalty,
        severity: violation.severity,
        detectedAt: violation.detectedAt,
        resolved: violation.resolved || false,
        _original: violation
      }));
    } catch (error) {
      console.error('Error fetching violations:', error);
      throw error;
    }
  },

  // Get violation by ID
  getViolationById: async (id) => {
    try {
      const response = await academicAxios.get(API_ENDPOINTS.VIOLATIONS.GET_BY_ID(id));
      const violation = response.data?.data;
      if (!violation) return null;
      return {
        id: violation.violationId,
        submissionId: violation.submissionId,
        type: violation.type,
        description: violation.description,
        penalty: violation.penalty,
        severity: violation.severity,
        detectedAt: violation.detectedAt,
        resolved: violation.resolved || false,
        _original: violation
      };
    } catch (error) {
      console.error('Error fetching violation:', error);
      throw error;
    }
  },

  // Create new violation
  createViolation: async (violationData) => {
    try {
      // Map UI format to API format - Use PascalCase for C# backend
      const apiData = {
        SubmissionId: violationData.submissionId,
        Type: violationData.type,
        Description: violationData.description,
        Penalty: violationData.penalty,
        Severity: violationData.severity
      };
      
      const response = await academicAxios.post(API_ENDPOINTS.VIOLATIONS.CREATE, apiData);
      const violation = response.data?.data;
      
      // Map response back to UI format
      return {
        id: violation.violationId,
        submissionId: violation.submissionId,
        type: violation.type,
        description: violation.description,
        penalty: violation.penalty,
        severity: violation.severity,
        detectedAt: violation.detectedAt,
        resolved: violation.resolved || false,
        _original: violation
      };
    } catch (error) {
      console.error('Error creating violation:', error);
      throw error;
    }
  },

  // Update violation
  updateViolation: async (id, violationData) => {
    try {
      // Backend expects FormData (not JSON) because of [FromForm] attribute
      const formData = new FormData();
      formData.append('Type', violationData.type);
      formData.append('Description', violationData.description || '');
      formData.append('Penalty', violationData.penalty.toString());
      formData.append('Severity', violationData.severity);
      formData.append('Resolved', violationData.resolved || false);
      if (violationData.detectedBy_UserID) {
        formData.append('DetectedBy_UserID', violationData.detectedBy_UserID);
      }
      
      console.log('Updating violation ID:', id);
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await academicAxios.put(API_ENDPOINTS.VIOLATIONS.UPDATE(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const violation = response.data?.data;
      
      // Map response back to UI format
      return {
        id: violation.violationId,
        submissionId: violation.submissionId,
        type: violation.type,
        description: violation.description,
        penalty: violation.penalty,
        severity: violation.severity,
        detectedAt: violation.detectedAt,
        resolved: violation.resolved || false,
        _original: violation
      };
    } catch (error) {
      console.error('Error updating violation:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Validation errors:', error.response.data?.errors);
      }
      throw error;
    }
  },

  // Delete violation
  deleteViolation: async (id) => {
    try {
      await academicAxios.patch(API_ENDPOINTS.VIOLATIONS.DELETE(id));
      return true;
    } catch (error) {
      console.error('Error deleting violation:', error);
      throw error;
    }
  }
};

export default violationService;
