import axios from '../config/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await axios.get('/api/v1/subjects');
      // Map API response to UI format
      const subjects = response.data.data || [];
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
      const response = await axios.get(`/api/v1/subjects/${id}`);
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
      const response = await axios.post('/api/v1/subjects', apiData);
      // Map response back to UI format
      const subject = response.data.data;
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
      const response = await axios.put(`/api/v1/subjects/${id}`, apiData);
      // Map response back to UI format
      const subject = response.data.data;
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
      await axios.delete(`/api/v1/subjects/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }
};

export default subjectService;
