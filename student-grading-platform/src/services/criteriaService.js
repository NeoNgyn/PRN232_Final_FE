/**
 * Criteria Service - API integration for Grading Criteria CRUD operations
 * 
 * This service handles all API calls related to grading criteria, including:
 * - Fetching criteria lists (with query parameters and OData support)
 * - Creating, updating, and deleting criteria
 * - Data mapping between API format and UI format
 * 
 * Using Axios for cleaner HTTP requests with automatic JSON parsing and interceptors
 * 
 * API Response Format: { data: CriteriaListResponse[] }
 * UI Format: { id, name, maxScore, order, examId }
 */

import axiosInstance from '../config/axiosConfig';

// Map API response to UI format
const mapCriteriaToUI = (apiCriteria) => {
  return {
    id: apiCriteria.criteriaId,
    name: apiCriteria.criteriaName,
    maxScore: apiCriteria.maxScore,
    order: apiCriteria.sortOrder,
    examId: apiCriteria.examId
  };
};

// Get all criteria with optional query parameters
export const getAllCriteria = async (queryParams = {}) => {
  const data = await axiosInstance.get('/api/v1/criterias', { params: queryParams });
  return Array.isArray(data) ? data.map(mapCriteriaToUI) : [];
};

// Query criteria with OData support
export const queryCriteria = async (odataQuery = '') => {
  const data = await axiosInstance.get(`/api/v1/criterias/query${odataQuery ? `?${odataQuery}` : ''}`);
  return Array.isArray(data) ? data.map(mapCriteriaToUI) : [];
};

// Get criteria by ID
export const getCriteriaById = async (id) => {
  const data = await axiosInstance.get(`/api/v1/criterias/${id}`);
  return data ? mapCriteriaToUI(data) : null;
};

// Map UI data to API request format
const mapUIToAPI = (uiCriteria) => {
  return {
    examId: uiCriteria.examId,
    criteriaName: uiCriteria.name || uiCriteria.criteriaName,
    maxScore: uiCriteria.maxScore,
    sortOrder: uiCriteria.order || uiCriteria.sortOrder || 0
  };
};

// Create new criteria
export const createCriteria = async (criteriaData) => {
  const apiData = mapUIToAPI(criteriaData);
  const data = await axiosInstance.post('/api/v1/criterias', apiData);
  return data ? mapCriteriaToUI(data) : null;
};

// Update criteria
export const updateCriteria = async (id, criteriaData) => {
  const apiData = mapUIToAPI(criteriaData);
  
  // Backend expects FormData for PUT request
  const formData = new FormData();
  Object.keys(apiData).forEach(key => {
    if (apiData[key] !== null && apiData[key] !== undefined) {
      formData.append(key, apiData[key]);
    }
  });

  const data = await axiosInstance.put(`/api/v1/criterias/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return data ? mapCriteriaToUI(data) : null;
};

// Delete criteria
export const deleteCriteria = async (id) => {
  await axiosInstance.delete(`/api/v1/criterias/${id}`);
  return { success: true };
};

// Get criteria by exam ID (helper function for filtering)
export const getCriteriaByExamId = async (examId) => {
  return getAllCriteria({ examId });
};
