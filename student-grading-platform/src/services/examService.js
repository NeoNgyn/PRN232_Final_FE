import { academicAxios } from '../config/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

const examService = {
  // Get all exams
  getAllExams: async () => {
    try {
      const response = await academicAxios.get(API_ENDPOINTS.EXAMS.GET_ALL);
      const exams = response.data?.data || [];
      // Map API response to UI format
      return exams.map(exam => ({
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
      const response = await academicAxios.get(API_ENDPOINTS.EXAMS.GET_BY_ID(id));
      const exam = response.data?.data;
      if (!exam) return null;
      
      console.log('Exam from backend:', exam); // Debug log
      
      return {
        id: exam.examId,
        subjectId: exam.subjectId,
        semesterId: exam.semesterId,
        examName: exam.examName,
        examType: exam.examType,
        createdAt: exam.createdAt,
        // Include nested objects if available
        subject: exam.subject,
        semester: exam.semester,
        _original: exam
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
      const response = await academicAxios.post(API_ENDPOINTS.EXAMS.CREATE, apiData);
      const exam = response.data?.data;
      // Map response back to UI format
      return {
        id: exam.examId,
        subjectId: exam.subjectId,
        semesterId: exam.semesterId,
        examName: exam.examName,
        examType: exam.examType,
        createdAt: exam.createdAt,
        subject: exam.subject,
        semester: exam.semester,
        _original: exam
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
      
      const response = await academicAxios.put(API_ENDPOINTS.EXAMS.UPDATE(id), apiData);
      const exam = response.data?.data;
      // Map response back to UI format
      return {
        id: exam.examId,
        subjectId: exam.subjectId,
        semesterId: exam.semesterId,
        examName: exam.examName,
        examType: exam.examType,
        createdAt: exam.createdAt,
        subject: exam.subject,
        semester: exam.semester,
        _original: exam
      };
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },

  // Delete exam
  deleteExam: async (id) => {
    try {
      await academicAxios.delete(API_ENDPOINTS.EXAMS.DELETE(id));
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }
};

export default examService;
