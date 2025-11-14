import axiosInstance from '../config/axiosConfig';

const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await axiosInstance.get('/subjects');
      // Map API response to UI format
      return response.map(subject => ({
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
      const response = await axiosInstance.get(`/subjects/${id}`);
      return {
        id: response.subjectId,
        code: response.subjectCode,
        name: response.subjectName
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
      const response = await axiosInstance.post('/subjects', apiData);
      // Map response back to UI format
      return {
        id: response.subjectId,
        code: response.subjectCode,
        name: response.subjectName
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
      const response = await axiosInstance.put(`/subjects/${id}`, apiData);
      // Map response back to UI format
      return {
        id: response.subjectId,
        code: response.subjectCode,
        name: response.subjectName
      };
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  // Delete subject
  deleteSubject: async (id) => {
    try {
      await axiosInstance.delete(`/subjects/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }
};

export default subjectService;
