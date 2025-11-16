/**
 * Submission Service - API integration for submission operations
 * 
 * Handles CRUD operations for submissions:
 * - Get all submissions
 * - Get submissions by exam ID
 * - Get submission by ID
 * - Create submission
 * - Update submission
 * - Delete submission
 */

import axiosInstance from '../config/axiosConfig';

const submissionService = {
  // Get all submissions
  getAllSubmissions: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/submissions');
      return response.map(submission => ({
        id: submission.submissionId,
        examId: submission.examId,
        studentId: submission.studentId,
        examinerId: submission.examinerId,
        filePath: submission.filePath,
        originalFileName: submission.originalFileName,
        uploadedAt: submission.uploadedAt,
        totalScore: submission.totalScore,
        gradingStatus: submission.gradingStatus,
        _original: submission
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  // Get submissions by exam ID and examiner ID
  getSubmissionsByExamAndExaminer: async (examId, examinerId) => {
    try {
      const response = await axiosInstance.get('/api/v1/submissions/query', {
        params: {
          examId,
          examinerId
        }
      });
      return response.map(submission => ({
        id: submission.submissionId,
        examId: submission.examId,
        studentId: submission.studentId,
        examinerId: submission.examinerId,
        filePath: submission.filePath,
        originalFileName: submission.originalFileName,
        uploadedAt: submission.uploadedAt,
        totalScore: submission.totalScore,
        gradingStatus: submission.gradingStatus,
        _original: submission
      }));
    } catch (error) {
      console.error('Error fetching submissions by exam and examiner:', error);
      throw error;
    }
  },

  // Get submission by ID (with detailed info including grades and violations)
  getSubmissionById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/v1/submissions/${id}`);
      return {
        id: response.submissionId,
        examId: response.examId,
        studentId: response.studentId,
        examinerId: response.examinerId,
        filePath: response.filePath,
        originalFileName: response.originalFileName,
        uploadedAt: response.uploadedAt,
        totalScore: response.totalScore,
        gradingStatus: response.gradingStatus,
        grades: response.grades || [],
        violations: response.violations || [],
        _original: response
      };
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  },

  // Create submission with file upload
  createSubmission: async (examId, examinerId, file) => {
    try {
      const formData = new FormData();
      formData.append('ExamId', examId);
      formData.append('ExaminerId', examinerId);
      formData.append('FileSubmit', file);

      const response = await axiosInstance.post('/api/v1/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return {
        id: response.submissionId,
        examId: response.examId,
        studentId: response.studentId,
        examinerId: response.examinerId,
        filePath: response.filePath,
        originalFileName: response.originalFileName,
        uploadedAt: response.uploadedAt,
        totalScore: response.totalScore,
        gradingStatus: response.gradingStatus,
        _original: response
      };
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  // Update submission
  updateSubmission: async (id, submissionData) => {
    try {
      const apiData = {
        // Add any fields that need to be updated
        ...submissionData
      };

      const response = await axiosInstance.put(`/api/v1/submissions/${id}`, apiData);
      return {
        id: response.submissionId,
        examId: response.examId,
        studentId: response.studentId,
        examinerId: response.examinerId,
        filePath: response.filePath,
        originalFileName: response.originalFileName,
        uploadedAt: response.uploadedAt,
        totalScore: response.totalScore,
        gradingStatus: response.gradingStatus,
        _original: response
      };
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },

  // Delete submission
  deleteSubmission: async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/submissions/${id}`);
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
};

export default submissionService;
