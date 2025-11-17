/**
 * File Service - API integration for file operations
 * 
 * Handles file uploads and imports including:
 * - Student file imports
 * - Criteria Excel imports
 * - RAR/ZIP extraction
 */

import { academicAxios } from '../config/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

// Import criteria from Excel file
export const importCriteria = async (file, examId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('examId', examId);

  const response = await academicAxios.post(API_ENDPOINTS.FILES.IMPORT_CRITERIA, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // Response format: { message, importedCount, criterias }
  return response;
};

// Import students from JSON file
export const importStudents = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await academicAxios.post(API_ENDPOINTS.FILES.IMPORT_STUDENTS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // Response format: { message, source, importedCount, students }
  return response;
};

// Extract RAR file and create submissions
export const extractRarAndCreateSubmissions = async (rarFile, examId, examinerId) => {
  const formData = new FormData();
  formData.append('RARFile', rarFile);
  formData.append('ExamId', examId);
  formData.append('ExaminerId', examinerId);

  const response = await academicAxios.post(API_ENDPOINTS.FILES.EXTRACT_RAR, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // Response format: { message, totalSubmissions, submissions }
  return response;
};

// Get file URL
export const getFileUrl = async (filePath) => {
  const response = await academicAxios.get(API_ENDPOINTS.FILES.GET_FILE_URL(filePath));
  return response.data?.url || response.url;
};

// Export summary Excel for all submissions in an exam
export const exportSummaryExcel = async (examId) => {
  const response = await academicAxios.get(`/api/v1/files/export-summary/${examId}`);
  
  // Response format: { examId, exported, files: [{ SubmissionId, StudentId, Url }] }
  return response.data;
};
