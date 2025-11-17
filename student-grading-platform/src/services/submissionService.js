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
      const submissions = response.data.data || [];
      return submissions.map(submission => ({
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

  // Get submissions by exam ID only (for managers/admins)
  getSubmissionsByExam: async (examId) => {
    try {
      // Use OData query to get all submissions for an exam
      // Note: SubmissionListResponse doesn't include Grades and Violations
      const params = {
        $filter: `ExamId eq ${examId}`,
        $expand: 'Student,Exam($expand=Subject,Semester)'
      };
      
      const response = await axiosInstance.get('/api/v1/submission/query', { params });
      const responseData = response.data.data || response.data;
      const submissions = Array.isArray(responseData) ? responseData : (responseData.value || []);
      
      return submissions
        .filter(submission => submission && (submission.submissionId || submission.SubmissionId))
        .map(submission => ({
          id: submission.SubmissionId || submission.submissionId,
          examId: submission.ExamId || submission.examId,
          studentId: submission.StudentId || submission.studentId || 'Unknown',
          examinerId: submission.ExaminerId || submission.examinerId,
          secondExaminerId: submission.SecondExaminerId || submission.secondExaminerId,
          filePath: submission.FilePath || submission.filePath,
          originalFileName: submission.OriginalFileName || submission.originalFileName,
          uploadedAt: submission.UploadedAt || submission.uploadedAt,
          totalScore: submission.TotalScore ?? submission.totalScore ?? 0,
          gradingStatus: submission.GradingStatus || submission.gradingStatus || 'Pending',
          isApproved: submission.IsApproved ?? submission.isApproved ?? false,
          grades: [], // Not available in list response
          violations: [], // Not available in list response
          student: (submission.Student || submission.student) ? {
            studentId: submission.Student?.StudentId || submission.student?.studentId,
            fullName: submission.Student?.FullName || submission.student?.fullName
          } : null,
          exam: (submission.Exam || submission.exam) ? {
            examId: submission.Exam?.ExamId || submission.exam?.examId,
            examName: submission.Exam?.ExamName || submission.exam?.examName,
            examType: submission.Exam?.ExamType || submission.exam?.examType,
            subject: (submission.Exam?.Subject || submission.exam?.subject) ? {
              subjectCode: submission.Exam?.Subject?.SubjectCode || submission.exam?.subject?.subjectCode,
              subjectName: submission.Exam?.Subject?.SubjectName || submission.exam?.subject?.subjectName
            } : null,
            semester: (submission.Exam?.Semester || submission.exam?.semester) ? {
              semesterCode: submission.Exam?.Semester?.SemesterCode || submission.exam?.semester?.semesterCode,
              semesterName: submission.Exam?.Semester?.SemesterName || submission.exam?.semester?.semesterName
            } : null
          } : null,
          _original: submission
        }));
    } catch (error) {
      console.error('Error fetching submissions by exam:', error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  },

  // Get submissions by exam ID and examiner ID
  getSubmissionsByExamAndExaminer: async (examId, examinerId) => {
    try {
      // Use path parameters to match backend route: /api/v1/submission/exam/{examId}/examiner/{examinerId}
      const response = await axiosInstance.get(`/api/v1/submission/exam/${examId}/examiner/${examinerId}`);
      const submissions = response.data.data || [];
      
      // Filter out invalid submissions and map to UI format
      return submissions
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
            studentId: submission.student.StudentId || submission.student.studentId,
            fullName: submission.student.FullName || submission.student.fullName
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
      const submission = response.data.data;
      return {
        id: submission.submissionId,
        submissionId: submission.submissionId, // Keep submissionId for violations and other operations
        examId: submission.examId,
        studentId: submission.studentId,
        examinerId: submission.examinerId,
        filePath: submission.filePath,
        originalFileName: submission.originalFileName,
        uploadedAt: submission.uploadedAt,
        totalScore: submission.totalScore,
        gradingStatus: submission.gradingStatus,
        isApproved: submission.isApproved,
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
      const submission = response.data.data;

      return {
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
      const submission = response.data.data;
      return {
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
  },

  // Assign moderator (second examiner) to submission for re-grading
  assignModerator: async (submissionId, moderatorId) => {
    try {
      console.log('Assigning moderator:', { submissionId, moderatorId });
      
      // IMPORTANT: Only send SecondExaminerId, DO NOT send null for other fields
      // Backend AutoMapper will only update non-null fields from the request
      const updateData = {
        SecondExaminerId: moderatorId
      };
      
      console.log('Request body:', updateData);
      
      const response = await axiosInstance.put(
        `/api/v1/submission/${submissionId}/update`, 
        updateData
      );
      
      console.log('Response:', response);
      const submission = response.data.data;
      console.log('Moderator assigned successfully:', submission);
      
      return {
        id: submission.submissionId,
        examId: submission.examId,
        studentId: submission.studentId,
        examinerId: submission.examinerId,
        secondExaminerId: submission.secondExaminerId,
        filePath: submission.filePath,
        originalFileName: submission.originalFileName,
        uploadedAt: submission.uploadedAt,
        totalScore: submission.totalScore,
        gradingStatus: submission.gradingStatus,
        _original: submission
      };
    } catch (error) {
      console.error('Error assigning moderator:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.data?.errors);
      throw error;
    }
  },

  // Get submissions that need re-grading (low scores or flagged)
  getSubmissionsNeedingRegrade: async () => {
    try {
      // Get all submissions and filter those with low scores or violations
      const response = await axiosInstance.get('/api/v1/submission');
      const submissions = response.data.data || [];
      
      // Filter: score <= 3 or has violations or needs review
      return submissions
        .filter(submission => {
          const needsRegrade = 
            (submission.totalScore !== null && submission.totalScore <= 3) ||
            (submission.violations && submission.violations.length > 0) ||
            submission.gradingStatus === 'NeedsReview';
          return needsRegrade;
        })
        .map(submission => ({
          id: submission.submissionId,
          examId: submission.examId,
          studentId: submission.studentId || 'Unknown',
          examinerId: submission.examinerId,
          secondExaminerId: submission.secondExaminerId,
          filePath: submission.filePath,
          originalFileName: submission.originalFileName,
          uploadedAt: submission.uploadedAt,
          totalScore: submission.totalScore || 0,
          gradingStatus: submission.gradingStatus || 'Pending',
          grades: submission.grades || [],
          violations: submission.violations || [],
          student: submission.student ? {
            studentId: submission.student.StudentId || submission.student.studentId,
            fullName: submission.student.FullName || submission.student.fullName
          } : null,
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
      console.error('Error fetching submissions needing regrade:', error);
      return [];
    }
  },

  // Get submissions assigned to a moderator (SecondExaminerId)
  getSubmissionsByModerator: async (moderatorId) => {
    try {
      console.log('Fetching submissions for moderator:', moderatorId);
      
      const response = await axiosInstance.get('/api/v1/submission');
      const submissions = response.data.data || [];
      
      // Filter submissions where SecondExaminerId matches
      return submissions
        .filter(s => s.secondExaminerId === moderatorId || s.SecondExaminerId === moderatorId)
        .map(submission => ({
          id: submission.submissionId,
          examId: submission.examId,
          studentId: submission.studentId || 'Unknown',
          examinerId: submission.examinerId,
          secondExaminerId: submission.secondExaminerId || submission.SecondExaminerId,
          filePath: submission.filePath,
          originalFileName: submission.originalFileName,
          uploadedAt: submission.uploadedAt,
          totalScore: submission.totalScore || 0,
          gradingStatus: submission.gradingStatus || 'Pending',
          grades: submission.grades || [],
          violations: submission.violations || [],
          student: submission.student ? {
            studentId: submission.student.StudentId || submission.student.studentId,
            fullName: submission.student.FullName || submission.student.fullName
          } : null,
          exam: submission.exam ? {
            examId: submission.exam.examId || submission.exam.ExamId,
            examName: submission.exam.examName || submission.exam.ExamName,
            examType: submission.exam.examType || submission.exam.ExamType,
            subject: submission.exam.subject || submission.exam.Subject ? {
              subjectCode: (submission.exam.subject || submission.exam.Subject).subjectCode || (submission.exam.subject || submission.exam.Subject).SubjectCode,
              subjectName: (submission.exam.subject || submission.exam.Subject).subjectName || (submission.exam.subject || submission.exam.Subject).SubjectName
            } : null,
            semester: submission.exam.semester || submission.exam.Semester ? {
              semesterCode: (submission.exam.semester || submission.exam.Semester).semesterCode || (submission.exam.semester || submission.exam.Semester).SemesterCode,
              semesterName: (submission.exam.semester || submission.exam.Semester).semesterName || (submission.exam.semester || submission.exam.Semester).SemesterName
            } : null
          } : null,
          _original: submission
        }));
    } catch (error) {
      console.error('Error fetching submissions by moderator:', error);
      return [];
    }
  },

  // Query submissions with OData filters (search by student name or ID)
  querySubmissions: async (examId, examinerId, searchTerm = '') => {
    try {
      console.log('=== Query Submissions ===');
      console.log('examId:', examId);
      console.log('examinerId:', examinerId);
      console.log('searchTerm:', searchTerm);
      
      // If no search term, use the dedicated endpoint which properly handles SecondExaminerId
      // This endpoint already checks: (ExaminerId == examinerId || SecondExaminerId == examinerId)
      if (!searchTerm || !searchTerm.trim()) {
        console.log('Using dedicated endpoint (no search term)');
        const response = await axiosInstance.get(`/api/v1/submission/exam/${examId}/examiner/${examinerId}`);
        console.log('Dedicated endpoint response:', response.data);
        
        const submissions = response.data.data || [];
        console.log('Number of submissions:', submissions.length);
        
        // Map to UI format
        return submissions
          .filter(submission => submission && submission.submissionId)
          .map(submission => ({
            id: submission.submissionId,
            examId: submission.examId,
            studentId: submission.studentId || 'Unknown',
            examinerId: submission.examinerId,
            secondExaminerId: submission.secondExaminerId,
            filePath: submission.filePath,
            originalFileName: submission.originalFileName,
            uploadedAt: submission.uploadedAt,
            totalScore: submission.totalScore ?? 0,
            gradingStatus: submission.gradingStatus || 'Pending',
            grades: submission.grades || [],
            violations: submission.violations || [],
            student: submission.student ? {
              studentId: submission.student.studentId,
              fullName: submission.student.fullName
            } : null,
            exam: submission.exam ? {
              examId: submission.exam.examId,
              examName: submission.exam.examName,
              examType: submission.exam.examType,
              subject: submission.exam.subject,
              semester: submission.exam.semester
            } : null,
            _original: submission
          }));
      }
      
      // Only use OData query when searching (more complex, has issues with nullable GUIDs)
      console.log('Using OData endpoint (with search term)');
      const params = {};
      
      // Build OData filter query
      let filterParts = [];
      
      if (examId) {
        filterParts.push(`ExamId eq ${examId}`);
      }
      
      if (examinerId) {
        // Note: OData has issues with nullable GUID comparison for SecondExaminerId
        // This may not work reliably for moderators
        filterParts.push(`(ExaminerId eq ${examinerId} or SecondExaminerId eq ${examinerId})`);
      }
      
      // Add search filter
      if (searchTerm && searchTerm.trim()) {
        const search = searchTerm.trim().toUpperCase();
        const searchFilter = `(contains(toupper(StudentId), '${search}') or contains(toupper(Student/FullName), '${search}'))`;
        filterParts.push(searchFilter);
      }
      
      if (filterParts.length > 0) {
        params.$filter = filterParts.join(' and ');
      }
      
      params.$expand = 'Student,Exam($expand=Subject,Semester)';

      console.log('OData params:', params);
      console.log('OData filter string:', params.$filter);

      // Call OData endpoint
      const response = await axiosInstance.get('/api/v1/submission/query', { params });

      console.log('OData raw response:', response);
      console.log('OData response.data:', response.data);

      // Handle different response formats
      // OData might return array directly or { value: [...] }
      const responseData = response.data.data || response.data;
      let submissions = Array.isArray(responseData) ? responseData : (responseData.value || []);
      
      console.log('Parsed submissions array:', submissions);
      console.log('Number of submissions:', submissions.length);
      
      // If no data, return empty array instead of throwing error
      if (!submissions || submissions.length === 0) {
        console.log('No submissions found');
        return [];
      }
      
      // Map to UI format - Handle both PascalCase (OData) and camelCase
      return submissions
        .filter(submission => submission && (submission.submissionId || submission.SubmissionId))
        .map(submission => {
          console.log('Mapping submission:', submission);
          
          return {
            id: submission.SubmissionId || submission.submissionId,
            examId: submission.ExamId || submission.examId,
            studentId: submission.StudentId || submission.studentId || 'Unknown',
            examinerId: submission.ExaminerId || submission.examinerId,
            filePath: submission.FilePath || submission.filePath,
            originalFileName: submission.OriginalFileName || submission.originalFileName,
            uploadedAt: submission.UploadedAt || submission.uploadedAt,
            totalScore: submission.TotalScore ?? submission.totalScore ?? 0,
            gradingStatus: submission.GradingStatus || submission.gradingStatus || 'Pending',
            grades: submission.Grades || submission.grades || [],
            violations: submission.Violations || submission.violations || [],
            // Student info - OData returns PascalCase
            student: (submission.Student || submission.student) ? {
              studentId: submission.Student?.StudentId || submission.student?.studentId || submission.Student?.StudentId,
              fullName: submission.Student?.FullName || submission.student?.fullName || submission.Student?.FullName
            } : null,
            // Exam info - OData returns PascalCase
            exam: (submission.Exam || submission.exam) ? {
              examId: submission.Exam?.ExamId || submission.exam?.examId,
              examName: submission.Exam?.ExamName || submission.exam?.examName,
              examType: submission.Exam?.ExamType || submission.exam?.examType,
              subject: (submission.Exam?.Subject || submission.exam?.subject) ? {
                subjectCode: submission.Exam?.Subject?.SubjectCode || submission.exam?.subject?.subjectCode,
                subjectName: submission.Exam?.Subject?.SubjectName || submission.exam?.subject?.subjectName
              } : null,
              semester: (submission.Exam?.Semester || submission.exam?.semester) ? {
                semesterCode: submission.Exam?.Semester?.SemesterCode || submission.exam?.semester?.semesterCode,
                semesterName: submission.Exam?.Semester?.SemesterName || submission.exam?.semester?.semesterName
              } : null
            } : null,
            _original: submission
          };
        });
    } catch (error) {
      console.error('Error querying submissions:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Return empty array on error to prevent UI crash
      return [];
    }
  },

  // Assign moderator (second examiner) to a submission for re-grading
  assignModerator: async (submissionId, moderatorId) => {
    try {
      console.log('=== Assign Moderator ===');
      console.log('submissionId:', submissionId);
      console.log('moderatorId:', moderatorId);
      
      // Update submission with SecondExaminerId - use correct endpoint with /update
      const response = await axiosInstance.put(`/api/v1/submission/${submissionId}/update`, {
        SecondExaminerId: moderatorId
      });
      
      console.log('Assign moderator response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error assigning moderator:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Approve submission (set IsApproved = true)
  approveSubmission: async (submissionId) => {
    try {
      console.log('=== Approve Submission ===');
      console.log('submissionId:', submissionId);
      
      // Update submission with IsApproved = true
      const response = await axiosInstance.put(`/api/v1/submission/${submissionId}/update`, {
        IsApproved: true
      });
      
      console.log('Approve submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error approving submission:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }
};

export default submissionService;
