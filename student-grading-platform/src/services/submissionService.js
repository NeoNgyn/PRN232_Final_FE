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
      const response = await axiosInstance.get('/api/v1/submission');
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
      const response = await axiosInstance.get('/api/v1/submission/by-exam-examiner', {
        params: {
          examId,
          examinerId
        }
      });
      
      // Filter out invalid submissions and map to UI format
      return response
        .filter(submission => submission && submission.submissionId)
        .map(submission => ({
          id: submission.submissionId,
          examId: submission.examId,
          studentId: submission.studentId || 'Unknown',
          examinerId: submission.examinerId,
          filePath: submission.filePath,
          originalFileName: submission.originalFileName,
          uploadedAt: submission.uploadedAt,
          totalScore: submission.totalScore || 0,
          gradingStatus: submission.gradingStatus || 'Pending',
          grades: submission.grades || [],
          violations: submission.violations || [],
          // Student info
          student: submission.student ? {
            studentId: submission.student.studentId,
            fullName: submission.student.fullName
          } : null,
          // Exam info
          exam: submission.exam ? {
            examId: submission.exam.examId,
            examName: submission.exam.examName,
            examType: submission.exam.examType,
            subject: submission.exam.subject ? {
              subjectCode: submission.exam.subject.subjectCode,
              subjectName: submission.exam.subject.subjectName
            } : null,
            semester: submission.exam.semester ? {
              semesterCode: submission.exam.semester.semesterCode,
              semesterName: submission.exam.semester.semesterName
            } : null
          } : null,
          _original: submission
        }));
    } catch (error) {
      console.error('Error fetching submissions by exam and examiner:', error);
      // Return empty array instead of throwing to prevent UI crash
      if (error.response?.status === 500) {
        console.warn('Server error - returning empty submissions list');
        return [];
      }
      throw error;
    }
  },

  // Get submission by ID (with detailed info including grades and violations)
  getSubmissionById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/v1/submission/${id}`);
      return {
        id: response.submissionId,
        submissionId: response.submissionId, // Keep submissionId for violations and other operations
        examId: response.examId,
        studentId: response.studentId,
        examinerId: response.examinerId,
        filePath: response.filePath,
        originalFileName: response.originalFileName,
        uploadedAt: response.uploadedAt,
        totalScore: response.totalScore,
        gradingStatus: response.gradingStatus,
        isApproved: response.isApproved,
        grades: response.grades || [],
        violations: response.violations || [],
        // Student info
        student: response.student ? {
          studentId: response.student.studentId,
          fullName: response.student.fullName
        } : null,
        // Exam info
        exam: response.exam ? {
          examId: response.exam.examId,
          examName: response.exam.examName,
          examType: response.exam.examType,
          subject: response.exam.subject ? {
            subjectCode: response.exam.subject.subjectCode,
            subjectName: response.exam.subject.subjectName
          } : null,
          semester: response.exam.semester ? {
            semesterCode: response.exam.semester.semesterCode,
            semesterName: response.exam.semester.semesterName
          } : null
        } : null,
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

      const response = await axiosInstance.post('/api/v1/submission', formData, {
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

      const response = await axiosInstance.put(`/api/v1/submission/${id}/update`, apiData);
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
      await axiosInstance.delete(`/api/v1/submission/${id}`);
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
};

export default submissionService;
