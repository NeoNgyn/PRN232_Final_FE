import { identityAxios, academicAxios } from '../config/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

const managerService = {
  /**
   * Get all teachers/examiners
   */
  getAllTeachers: async () => {
    try {
      const response = await identityAxios.get(API_ENDPOINTS.USERS.GET_TEACHERS);
      console.log('Raw teachers response:', response.data);
      
      // Backend returns { success, message, data }
      if (response.data && response.data.data) {
        const teachers = response.data.data;
        
        // Map UserResponse to UI format (UserId -> id, Name -> name/fullName)
        return teachers.map(teacher => ({
          id: teacher.UserId || teacher.userId,
          userId: teacher.UserId || teacher.userId,
          name: teacher.Name || teacher.name || teacher.Email || teacher.email,
          fullName: teacher.Name || teacher.name || teacher.Email || teacher.email,
          email: teacher.Email || teacher.email,
          lecturerCode: teacher.LecturerCode || teacher.lecturerCode || 'N/A',
          roleId: teacher.RoleId || teacher.roleId,
          isActive: teacher.IsActive ?? teacher.isActive,
          _original: teacher
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  /**
   * Upload RAR file and assign to examiner
   * @param {File} rarFile - The RAR file containing student submissions
   * @param {string} examId - The exam ID (GUID)
   * @param {string} examinerId - The examiner/teacher ID (GUID)
   */
  uploadRarFile: async (rarFile, examId, examinerId) => {
    try {
      const formData = new FormData();
      formData.append('RARFile', rarFile);
      formData.append('ExamId', examId);
      formData.append('ExaminerId', examinerId);

      const response = await academicAxios.post(
        API_ENDPOINTS.FILES.EXTRACT_RAR,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minutes timeout for large files
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading RAR file:', error);
      throw error;
    }
  },

  /**
   * Get all exams
   */
  getAllExams: async () => {
    try {
      const response = await academicAxios.get(API_ENDPOINTS.EXAMS.GET_ALL);
      // Backend returns { success, message, data }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  /**
   * Get submissions by exam
   * @param {string} examId - The exam ID
   */
  getSubmissionsByExam: async (examId) => {
    try {
      const response = await academicAxios.get(`/api/v1/Submissions?examId=${examId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  /**
   * Get submissions by examiner
   * @param {string} examinerId - The examiner ID
   */
  getSubmissionsByExaminer: async (examinerId) => {
    try {
      const response = await academicAxios.get(`/api/v1/Submissions?examinerId=${examinerId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }
};

export default managerService;
