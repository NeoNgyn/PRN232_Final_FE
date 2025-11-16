import axios from '../config/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

const semesterService = {
  // Get all semesters
  getAllSemesters: async () => {
    try {
      const response = await axios.get('/api/v1/semesters');
      // Map API response to UI format
      return (response.data.data || []).map(semester => ({
        id: semester.semesterId,
        code: semester.semesterCode,
        name: semester.semesterName || ''
      }));
    } catch (error) {
      console.error('Error fetching semesters:', error);
      throw error;
    }
  },

  // Get semester by ID
  getSemesterById: async (id) => {
    try {
      const response = await axios.get(`/api/v1/semesters/${id}`);
      return {
        id: response.semesterId,
        code: response.semesterCode,
        name: response.semesterName || ''
      };
    } catch (error) {
      console.error('Error fetching semester:', error);
      throw error;
    }
  },

  // Create new semester
  createSemester: async (semesterData) => {
    try {
      // Map UI format to API format
      const apiData = {
        semesterCode: semesterData.code,
        semesterName: semesterData.name || null
      };
      const response = await axios.post('/api/v1/semesters', apiData);
      // Map response back to UI format
      const data = response.data.data;
      return {
        id: data.semesterId,
        code: data.semesterCode,
        name: data.semesterName || ''
      };
    } catch (error) {
      console.error('Error creating semester:', error);
      throw error;
    }
  },

  // Update semester
  updateSemester: async (id, semesterData) => {
    try {
      // Map UI format to API format
      const apiData = {
        semesterCode: semesterData.code,
        semesterName: semesterData.name || null
      };
      const response = await axios.put(`/api/v1/semesters/${id}`, apiData);
      // Map response back to UI format
      const data = response.data.data;
      return {
        id: data.semesterId,
        code: data.semesterCode,
        name: data.semesterName || ''
      };
    } catch (error) {
      console.error('Error updating semester:', error);
      throw error;
    }
  },

  // Delete semester
  deleteSemester: async (id) => {
    try {
      await axios.delete(`/api/v1/semesters/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting semester:', error);
      throw error;
    }
  }
};

export default semesterService;
