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

// Map API response to UI format - Handle both PascalCase and camelCase
const mapCriteriaToUI = (apiCriteria) => {
  if (!apiCriteria) return null;
  
  return {
    id: apiCriteria.criteriaId || apiCriteria.CriteriaId,
    name: apiCriteria.criteriaName || apiCriteria.CriteriaName,
    maxScore: apiCriteria.maxScore || apiCriteria.MaxScore || 0,
    order: apiCriteria.sortOrder || apiCriteria.SortOrder || 0,
    examId: apiCriteria.examId || apiCriteria.ExamId,
    description: apiCriteria.description || apiCriteria.Description || ''
  };
};

// Get all criteria with optional query parameters
export const getAllCriteria = async (queryParams = {}) => {
  try {
    const data = await axiosInstance.get('/api/v1/criteria', { params: queryParams });
    return Array.isArray(data) ? data.map(mapCriteriaToUI).filter(Boolean) : [];
  } catch (error) {
    console.error('Error fetching all criteria:', error);
    throw error;
  }
};

// Query criteria with OData support
export const queryCriteria = async (odataQuery = '') => {
  try {
    const data = await axiosInstance.get(`/api/v1/criteria/query${odataQuery ? `?${odataQuery}` : ''}`);
    return Array.isArray(data) ? data.map(mapCriteriaToUI).filter(Boolean) : [];
  } catch (error) {
    console.error('Error querying criteria:', error);
    throw error;
  }
};

// Get criteria by ID
export const getCriteriaById = async (id) => {
  try {
    const data = await axiosInstance.get(`/api/v1/criteria/${id}`);
    return data ? mapCriteriaToUI(data) : null;
  } catch (error) {
    console.error('Error fetching criteria by ID:', error);
    throw error;
  }
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
  try {
    const apiData = mapUIToAPI(criteriaData);
    console.log('Creating criteria:', apiData);
    const data = await axiosInstance.post('/api/v1/criteria', apiData);
    console.log('Criteria created successfully:', data);
    return data ? mapCriteriaToUI(data) : null;
  } catch (error) {
    console.error('Error creating criteria:', error);
    throw error;
  }
};

// Update criteria
export const updateCriteria = async (id, criteriaData) => {
  try {
    const apiData = mapUIToAPI(criteriaData);
    
    // Backend expects FormData for PUT request
    const formData = new FormData();
    Object.keys(apiData).forEach(key => {
      if (apiData[key] !== null && apiData[key] !== undefined) {
        formData.append(key, apiData[key]);
      }
    });

    console.log('Updating criteria ID:', id);
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const data = await axiosInstance.put(`/api/v1/criteria/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('Criteria updated successfully:', data);
    return data ? mapCriteriaToUI(data) : null;
  } catch (error) {
    console.error('Error updating criteria:', error);
    throw error;
  }
};

// Delete criteria
export const deleteCriteria = async (id) => {
  try {
    console.log('Deleting criteria ID:', id);
    await axiosInstance.delete(`/api/v1/criteria/${id}/delete`);
    console.log('Criteria deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting criteria:', error);
    throw error;
  }
};

// Get criteria by exam ID - Use dedicated backend endpoint
export const getCriteriaByExamId = async (examId) => {
  try {
    console.log('[CriteriaService] Fetching criteria for exam ID:', examId);
    console.log('[CriteriaService] API URL:', `/api/v1/criteria/exam/${examId}`);
    
    // Backend endpoint: /api/v1/criteria/exam/{examId}
    const data = await axiosInstance.get(`/api/v1/criteria/exam/${examId}`);
    
    console.log('[CriteriaService] Raw response:', data);
    console.log('[CriteriaService] Is array?', Array.isArray(data));
    
    if (Array.isArray(data)) {
      const mapped = data.map(mapCriteriaToUI).filter(Boolean);
      console.log('[CriteriaService] Mapped criteria:', mapped);
      return mapped;
    }
    
    console.warn('[CriteriaService] Response is not an array');
    return [];
  } catch (error) {
    console.error('[CriteriaService] Error fetching criteria by exam ID:', error);
    if (error.response) {
      console.error('[CriteriaService] Response status:', error.response.status);
      console.error('[CriteriaService] Response data:', error.response.data);
    }
    throw error;
  }
};
