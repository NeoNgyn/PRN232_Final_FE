import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, UserCheck, AlertTriangle, Loader2, 
  AlertCircle, CheckCircle, XCircle, FileText 
} from 'lucide-react';
import submissionService from '../services/submissionService';
import AssignModeratorModal from '../components/AssignModeratorModal';
import './RegradeManagement.css';

/**
 * Regrade Management Component
 * Displays submissions that need re-grading and allows manager to assign moderators
 */
function RegradeManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, unassigned, assigned

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionService.getSubmissionsNeedingRegrade();
      setSubmissions(data);
    } catch (err) {
      setError('Không thể tải danh sách submissions cần chấm lại.');
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignModerator = (submission) => {
    setSelectedSubmission(submission);
    setShowAssignModal(true);
  };

  const handleCloseModal = () => {
    setShowAssignModal(false);
    setSelectedSubmission(null);
  };

  const handleAssignSuccess = () => {
    // Refresh submissions list after successful assignment
    fetchSubmissions();
  };

  const getFilteredSubmissions = () => {
    switch (filterStatus) {
      case 'unassigned':
        return submissions.filter(s => !s.secondExaminerId);
      case 'assigned':
        return submissions.filter(s => s.secondExaminerId);
      default:
        return submissions;
    }
  };

  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="regrade-management">
      <div className="panel-header">
        <div className="header-left">
          <h2>
            <RefreshCw size={24} />
            Quản lý Chấm Lại
          </h2>
          <p className="subtitle">
            Submissions có điểm thấp (≤3) hoặc có vi phạm cần được chấm lại
          </p>
        </div>
        <button className="btn btn-refresh" onClick={fetchSubmissions} disabled={isLoading}>
          {isLoading ? <Loader2 className="spinner" size={18} /> : <RefreshCw size={18} />}
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <AlertTriangle size={24} color="#92400e" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{submissions.length}</div>
            <div className="stat-label">Tổng cần chấm lại</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <XCircle size={24} color="#991b1b" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {submissions.filter(s => !s.secondExaminerId).length}
            </div>
            <div className="stat-label">Chưa assign</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <CheckCircle size={24} color="#065f46" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {submissions.filter(s => s.secondExaminerId).length}
            </div>
            <div className="stat-label">Đã assign</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Tất cả ({submissions.length})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'unassigned' ? 'active' : ''}`}
          onClick={() => setFilterStatus('unassigned')}
        >
          Chưa assign ({submissions.filter(s => !s.secondExaminerId).length})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilterStatus('assigned')}
        >
          Đã assign ({submissions.filter(s => s.secondExaminerId).length})
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Submissions Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={48} />
            <p>Đang tải danh sách submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} color="#9ca3af" />
            <h3>Không có submissions cần chấm lại</h3>
            <p>Tất cả submissions đều đã được chấm đúng hoặc đã được assign moderator</p>
          </div>
        ) : (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Exam</th>
                <th>Subject</th>
                <th>Điểm hiện tại</th>
                <th>Vi phạm</th>
                <th>Moderator</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.studentId}</td>
                  <td>{submission.student?.fullName || 'N/A'}</td>
                  <td>{submission.exam?.examName || 'N/A'}</td>
                  <td>
                    {submission.exam?.subject?.subjectCode || 'N/A'}
                    <br />
                    <small className="text-muted">
                      {submission.exam?.subject?.subjectName || ''}
                    </small>
                  </td>
                  <td>
                    <span className={`score ${submission.totalScore <= 1 ? 'critical' : 'low'}`}>
                      {submission.totalScore || 0} điểm
                    </span>
                  </td>
                  <td>
                    {submission.violations && submission.violations.length > 0 ? (
                      <span className="badge badge-warning">
                        {submission.violations.length} vi phạm
                      </span>
                    ) : (
                      <span className="badge badge-success">Không</span>
                    )}
                  </td>
                  <td>
                    {submission.secondExaminerId ? (
                      <span className="badge badge-success">
                        <CheckCircle size={14} />
                        Đã assign
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <XCircle size={14} />
                        Chưa assign
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-assign"
                      onClick={() => handleAssignModerator(submission)}
                      disabled={submission.secondExaminerId}
                    >
                      <UserCheck size={16} />
                      {submission.secondExaminerId ? 'Đã assign' : 'Assign Moderator'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Moderator Modal */}
      {showAssignModal && selectedSubmission && (
        <AssignModeratorModal
          submission={selectedSubmission}
          onClose={handleCloseModal}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}

export default RegradeManagement;
