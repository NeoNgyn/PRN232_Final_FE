import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, RefreshCw, FileCheck, AlertCircle, 
  Loader2, ClipboardList, CheckCircle 
} from 'lucide-react';
import submissionService from '../services/submissionService';
import './ModeratorDashboard.css';

/**
 * Moderator Dashboard
 * For teachers assigned as second examiners (moderators) to re-grade submissions
 */
function ModeratorDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get submissions where this user is the SecondExaminerId
      const data = await submissionService.getSubmissionsByModerator(user.id);
      setSubmissions(data);
    } catch (err) {
      setError('Không thể tải danh sách submissions được assign.');
      console.error('Error fetching moderator submissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchSubmissions();
    }
  }, [user, fetchSubmissions]);

  const handleGradeSubmission = (submission) => {
    // Navigate to grading page with submission ID
    navigate(`/grading/${submission.id}`, {
      state: { 
        submission,
        isModerator: true // Flag to indicate this is re-grading by moderator
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'grading':
      case 'inprogress':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="moderator-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <RefreshCw size={32} />
              Moderator Dashboard
            </h1>
            <p className="subtitle">Chấm lại các submissions được assign</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-refresh" onClick={fetchSubmissions} disabled={isLoading}>
              {isLoading ? <Loader2 className="spinner" size={18} /> : <RefreshCw size={18} />}
              Làm mới
            </button>
            <button className="btn btn-logout" onClick={onLogout}>
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2>Xin chào, {user?.fullName || user?.email}!</h2>
            <p>Bạn đang có <strong>{submissions.length}</strong> submissions cần chấm lại</p>
          </div>
          <div className="welcome-icon">
            <ClipboardList size={64} color="#3b82f6" />
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <FileCheck size={24} color="#1e40af" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{submissions.length}</div>
              <div className="stat-label">Tổng submissions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <AlertCircle size={24} color="#92400e" />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {submissions.filter(s => s.gradingStatus !== 'Completed').length}
              </div>
              <div className="stat-label">Chưa hoàn thành</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>
              <CheckCircle size={24} color="#065f46" />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {submissions.filter(s => s.gradingStatus === 'Completed').length}
              </div>
              <div className="stat-label">Đã hoàn thành</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Submissions Table */}
        <div className="submissions-section">
          <h3 className="section-title">
            <ClipboardList size={20} />
            Submissions được assign
          </h3>

          <div className="table-container">
            {isLoading ? (
              <div className="loading-state">
                <Loader2 className="spinner" size={48} />
                <p>Đang tải danh sách submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="empty-state">
                <FileCheck size={64} color="#9ca3af" />
                <h3>Chưa có submissions nào</h3>
                <p>Bạn chưa được assign submissions nào để chấm lại</p>
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
                    <th>Trạng thái</th>
                    <th>Vi phạm</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{submission.studentId}</td>
                      <td>{submission.student?.fullName || 'N/A'}</td>
                      <td>
                        {submission.exam?.examName || 'N/A'}
                        <br />
                        <small className="text-muted">
                          {submission.exam?.examType || ''}
                        </small>
                      </td>
                      <td>
                        {submission.exam?.subject?.subjectCode || 'N/A'}
                        <br />
                        <small className="text-muted">
                          {submission.exam?.subject?.subjectName || ''}
                        </small>
                      </td>
                      <td>
                        <span className="score">
                          {submission.totalScore || 0} điểm
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(submission.gradingStatus)}`}>
                          {submission.gradingStatus || 'Pending'}
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
                        <button
                          className="btn btn-grade"
                          onClick={() => handleGradeSubmission(submission)}
                        >
                          <FileCheck size={16} />
                          Chấm lại
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeratorDashboard;
