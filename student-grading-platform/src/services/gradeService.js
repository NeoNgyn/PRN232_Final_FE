import axiosInstance from '../config/axiosConfig';

const gradeService = {
  // Get all grades
  getAllGrades: async () => {
    try {
      const response = await axiosInstance.get('/grades');
      return response;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  // Get grade by ID
  getGradeById: async (id) => {
    try {
      const response = await axiosInstance.get(`/grades/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching grade:', error);
      throw error;
    }
  },

  // Create new grade
  createGrade: async (gradeData) => {
    try {
      // API expects: SubmissionId, CriteriaId, Score, Note
      const apiData = {
        submissionId: gradeData.submissionId,
        criteriaId: gradeData.criteriaId,
        score: gradeData.score,
        note: gradeData.note || null
      };
      const response = await axiosInstance.post('/grades', apiData);
      return response;
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  },

  // Update grade
  updateGrade: async (id, gradeData) => {
    try {
      // API expects FormData with Score and Note
      const formData = new FormData();
      if (gradeData.score !== undefined && gradeData.score !== null) {
        formData.append('Score', gradeData.score);
      }
      if (gradeData.note) {
        formData.append('Note', gradeData.note);
      }
      
      const response = await axiosInstance.put(`/grades/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  },

  // Delete grade
  deleteGrade: async (id) => {
    try {
      const response = await axiosInstance.patch(`/grades/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw error;
    }
  }
};

export default gradeService;
