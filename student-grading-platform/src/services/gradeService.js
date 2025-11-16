import axiosInstance from '../config/axiosConfig';

const gradeService = {
  // Get all grades
  getAllGrades: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/grade');
      return response;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  // Get grade by ID
  getGradeById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/v1/grade/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching grade:', error);
      throw error;
    }
  },

  // Create new grade
  createGrade: async (gradeData) => {
    try {
      // API expects: SubmissionId, CriteriaId, Score, Note (PascalCase)
      const apiData = {
        SubmissionId: gradeData.submissionId,
        CriteriaId: gradeData.criteriaId,
        Score: gradeData.score,
        Note: gradeData.note || null
      };
      console.log('Creating grade with data:', apiData);
      const response = await axiosInstance.post('/api/v1/grade', apiData);
      console.log('Grade created successfully:', response);
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
      
      console.log('Updating grade ID:', id);
      const response = await axiosInstance.put(`/api/v1/grade/${id}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Grade updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  },

  // Delete grade
  deleteGrade: async (id) => {
    try {
      console.log('Deleting grade ID:', id);
      const response = await axiosInstance.delete(`/api/v1/grade/${id}/delete`);
      console.log('Grade deleted successfully');
      return response;
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw error;
    }
  }
};

export default gradeService;
