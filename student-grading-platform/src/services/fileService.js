/**
 * File Service - API integration for file operations
 * 
 * Handles file uploads and imports including:
 * - Student file imports
 * - Criteria Excel imports
 * - RAR/ZIP extraction
 */

import axiosInstance from '../config/axiosConfig';

// Import criteria from Excel file
export const importCriteria = async (file, examId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('examId', examId);

  const response = await axiosInstance.post('/api/v1/files/import-criteria', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // Response format: { message, importedCount, criterias }
  return response;
};

// Import students from JSON file
export const importStudents = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post('/api/v1/files/import-student', formData, {
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

  const response = await axiosInstance.post('/api/v1/files/extract-rar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // Response format: { message, totalSubmissions, submissions }
  return response;
};

// Get file URL
export const getFileUrl = async (filePath) => {
  const response = await axiosInstance.get(`/api/v1/files/${encodeURIComponent(filePath)}`);
  return response.url;
};
