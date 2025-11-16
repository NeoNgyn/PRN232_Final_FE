import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const violationService = {
  // Get all violations
  getAllViolations: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.VIOLATIONS.GET_ALL);
      const violations = response.data.data || [];
      return violations.map(violation => ({
        id: violation.violationId,
        submissionId: violation.submissionId,
        type: violation.type,
        description: violation.description,
        severity: violation.severity,
        penalty: violation.penalty,
        detectedAt: violation.detectedAt,
        detectedBy: violation.detectedBy_UserID,
        resolved: violation.resolved
      }));
    } catch (error) {
      console.error('Error fetching violations:', error);
      throw error;
    }
  },

  // Get violation by ID
  getViolationById: async (id) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.VIOLATIONS.GET_BY_ID}/${id}`);
      const violation = response.data.data;
      return {
        id: violation.violationId,
        submissionId: violation.submissionId,
        type: violation.type,
        description: violation.description,
        severity: violation.severity,
        penalty: violation.penalty,
        detectedAt: violation.detectedAt,
        detectedBy: violation.detectedBy_UserID,
        resolved: violation.resolved
      };
    } catch (error) {
      console.error('Error fetching violation:', error);
      throw error;
    }
  },

  // Update violation
  updateViolation: async (id, violationData) => {
    try {
      const apiData = {
        type: violationData.type,
        description: violationData.description,
        severity: violationData.severity,
        penalty: violationData.penalty,
        detectedBy_UserID: violationData.detectedBy,
        resolved: violationData.resolved
      };
      const response = await axios.put(`${API_ENDPOINTS.VIOLATIONS.UPDATE}/${id}`, apiData);
      const violation = response.data.data;
      return {
        id: violation.violationId,
        submissionId: violation.submissionId,
        type: violation.type,
        description: violation.description,
        severity: violation.severity,
        penalty: violation.penalty,
        detectedAt: violation.detectedAt,
        detectedBy: violation.detectedBy_UserID,
        resolved: violation.resolved
      };
    } catch (error) {
      console.error('Error updating violation:', error);
      throw error;
    }
  },

  // Delete violation
  deleteViolation: async (id) => {
    try {
      await axios.patch(`${API_ENDPOINTS.VIOLATIONS.DELETE}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting violation:', error);
      throw error;
    }
  }
};

export default violationService;
