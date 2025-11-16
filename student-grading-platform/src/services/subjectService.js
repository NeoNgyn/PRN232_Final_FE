import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SUBJECTS.GET_ALL);
      // API returns: { status_code, message, reason, is_success, data }
      const subjects = response.data.data || [];
      // Map API response to UI format
      return subjects.map(subject => ({
        id: subject.subjectId,
        code: subject.subjectCode,
        name: subject.subjectName
      }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  // Get subject by ID
  getSubjectById: async (id) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.SUBJECTS.GET_BY_ID}/${id}`);
      const subject = response.data.data;
      return {
        id: subject.subjectId,
        code: subject.subjectCode,
        name: subject.subjectName
      };
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
  },

  // Create new subject
  createSubject: async (subjectData) => {
    try {
      // Map UI format to API format
      const apiData = {
        subjectCode: subjectData.code,
        subjectName: subjectData.name
      };
      const response = await axios.post(API_ENDPOINTS.SUBJECTS.CREATE, apiData);
      const subject = response.data.data;
      // Map response back to UI format
      return {
        id: subject.subjectId,
        code: subject.subjectCode,
        name: subject.subjectName
      };
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  // Update subject
  updateSubject: async (id, subjectData) => {
    try {
      // Map UI format to API format
      const apiData = {
        subjectCode: subjectData.code,
        subjectName: subjectData.name
      };
      const response = await axios.put(`${API_ENDPOINTS.SUBJECTS.UPDATE}/${id}`, apiData);
      const subject = response.data.data;
      // Map response back to UI format
      return {
        id: subject.subjectId,
        code: subject.subjectCode,
        name: subject.subjectName
      };
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  // Delete subject
  deleteSubject: async (id) => {
    try {
      await axios.delete(`${API_ENDPOINTS.SUBJECTS.DELETE}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }
};

export default subjectService;
