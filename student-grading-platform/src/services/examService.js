import axiosInstance from '../config/axiosConfig';

const examService = {
  // Get all exams
  getAllExams: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/exams');
      // Map API response to UI format
      return response.map(exam => ({
        id: exam.examId,
        subjectId: exam.subjectId,
        semesterId: exam.semesterId,
        examName: exam.examName,
        examType: exam.examType,
        createdAt: exam.createdAt,
        // Keep original backend fields for reference
        _original: exam
      }));
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  // Get exam by ID
  getExamById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/v1/exams/${id}`);
      return {
        id: response.examId,
        subjectId: response.subjectId,
        semesterId: response.semesterId,
        examName: response.examName,
        examType: response.examType,
        createdAt: response.createdAt,
        _original: response
      };
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },

  // Create new exam
  createExam: async (examData) => {
    try {
      // Map UI format to API format
      const apiData = {
        subjectId: examData.subjectId,
        semesterId: examData.semesterId,
        examName: examData.examName,
        examType: examData.examType,
        examPassword: examData.examPassword || null
      };
      const response = await axiosInstance.post('/api/v1/exams', apiData);
      // Map response back to UI format
      return {
        id: response.examId,
        subjectId: response.subjectId,
        semesterId: response.semesterId,
        examName: response.examName,
        examType: response.examType,
        createdAt: response.createdAt,
        _original: response
      };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  // Update exam
  updateExam: async (id, examData) => {
    try {
      // Map UI format to API format
      const apiData = {
        subjectId: examData.subjectId,
        semesterId: examData.semesterId,
        examName: examData.examName,
        examType: examData.examType
      };
      
      // Chỉ thêm examPassword vào request nếu có giá trị
      // Nếu không có = giữ nguyên password cũ ở backend
      if (examData.examPassword !== undefined && examData.examPassword !== null) {
        apiData.examPassword = examData.examPassword;
      }
      
      const response = await axiosInstance.put(`/api/v1/exams/${id}`, apiData);
      // Map response back to UI format
      return {
        id: response.examId,
        subjectId: response.subjectId,
        semesterId: response.semesterId,
        examName: response.examName,
        examType: response.examType,
        createdAt: response.createdAt,
        _original: response
      };
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },

  // Delete exam
  deleteExam: async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/exams/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }
};

export default examService;
