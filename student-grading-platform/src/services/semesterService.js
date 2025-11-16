import axiosInstance from '../config/axiosConfig';

const semesterService = {
  // Get all semesters
  getAllSemesters: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/semesters');
      // Map API response to UI format
      return response.map(semester => ({
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
      const response = await axiosInstance.get(`/api/v1/semesters/${id}`);
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
      const response = await axiosInstance.post('/api/v1/semesters', apiData);
      // Map response back to UI format
      return {
        id: response.semesterId,
        code: response.semesterCode,
        name: response.semesterName || ''
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
      const response = await axiosInstance.put(`/api/v1/semesters/${id}`, apiData);
      // Map response back to UI format
      return {
        id: response.semesterId,
        code: response.semesterCode,
        name: response.semesterName || ''
      };
    } catch (error) {
      console.error('Error updating semester:', error);
      throw error;
    }
  },

  // Delete semester
  deleteSemester: async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/semesters/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting semester:', error);
      throw error;
    }
  }
};

export default semesterService;
