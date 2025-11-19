import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import managerService from '../services/managerService';
import submissionService from '../services/submissionService';
import './AssignModeratorModal.css';

/**
 * Modal for assigning a moderator (second examiner) to a submission
 * Used when a submission needs re-grading
 */
function AssignModeratorModal({ submission, onClose, onSuccess }) {
  const [moderators, setModerators] = useState([]);
  const [selectedModeratorId, setSelectedModeratorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModerators, setIsLoadingModerators] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    setIsLoadingModerators(true);
    setError(null);
    try {
      // Get moderators (users with Moderator role) from identity service
      const moderators = await managerService.getAllModerators();
      console.log('Fetched moderators:', moderators);
      setModerators(moderators);
    } catch (err) {
      setError('Không thể tải danh sách moderator.');
      console.error('Error fetching moderators:', err);
    } finally {
      setIsLoadingModerators(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    
    if (!selectedModeratorId) {
      setError('Vui lòng chọn moderator.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Submission:', submission);
      console.log('Selected Moderator ID:', selectedModeratorId);
      console.log('Moderator ID type:', typeof selectedModeratorId);
      
      // Ensure moderatorId is a valid GUID string
      const moderatorGuid = String(selectedModeratorId).trim();
      
      console.log('Sending moderator GUID:', moderatorGuid);
      
      // Update submission with SecondExaminerId
      await submissionService.assignModerator(submission.id, moderatorGuid);
      
      // Success callback
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error assigning moderator:', err);
      console.error('Error details:', err.response?.data);
      
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.title ||
                       JSON.stringify(err.response?.data?.errors) ||
                       'Không thể assign moderator. Vui lòng thử lại.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-moderator-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <UserCheck size={24} />
            Assign Moderator cho Chấm Lại
          </h3>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Submission Info */}
          <div className="submission-info">
            <h4>Thông tin Submission</h4>
            <div className="info-grid">
              <div className="info-item">
                <label>Student ID:</label>
                <span>{submission.studentId}</span>
              </div>
              <div className="info-item">
                <label>Student Name:</label>
                <span>{submission.student?.fullName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Current Score:</label>
                <span className="score">{submission.totalScore || 0} điểm</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status ${submission.gradingStatus?.toLowerCase()}`}>
                  {submission.gradingStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Moderator Selection Form */}
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label htmlFor="moderator">Chọn Moderator *</label>
              {isLoadingModerators ? (
                <div className="loading-state">
                  <Loader2 className="spinner" size={24} />
                  <span>Đang tải danh sách moderators...</span>
                </div>
              ) : (
                <select
                  id="moderator"
                  value={selectedModeratorId}
                  onChange={(e) => setSelectedModeratorId(e.target.value)}
                  required
                  className="form-control"
                  disabled={isLoading}
                >
                  <option value="">-- Chọn Moderator --</option>
                  {moderators.map((moderator) => (
                    <option key={moderator.id} value={moderator.id}>
                      {moderator.fullName || moderator.email} ({moderator.email})
                    </option>
                  ))}
                </select>
              )}
              <small className="form-hint">
                Moderator sẽ chịu trách nhiệm chấm lại bài submission này
              </small>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading || isLoadingModerators || !selectedModeratorId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" size={18} />
                    Đang assign...
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    Assign Moderator
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssignModeratorModal;
