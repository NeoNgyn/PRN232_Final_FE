import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle, Search, Filter } from 'lucide-react';
import submissionService from '../services/submissionService';
import examService from '../services/examService';
import './ApprovalManagement.css';

function ApprovalManagement() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, approved, pending
  const [approvingIds, setApprovingIds] = useState(new Set());
  const [error, setError] = useState(null);

  // Fetch all exams
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoadingExams(true);
      try {
        const fetchedExams = await examService.getAllExams();
        setExams(fetchedExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
        setError('Không thể tải danh sách kỳ thi');
      } finally {
        setIsLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  // Fetch submissions when exam is selected
  useEffect(() => {
    if (!selectedExam) {
      setSubmissions([]);
      setFilteredSubmissions([]);
      return;
    }

    const fetchSubmissions = async () => {
      setIsLoadingSubmissions(true);
      setError(null);
      try {
        const fetchedSubmissions = await submissionService.getSubmissionsByExam(selectedExam);
        console.log('Fetched submissions:', fetchedSubmissions);
        setSubmissions(fetchedSubmissions);
        setFilteredSubmissions(fetchedSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError('Không thể tải danh sách bài nộp');
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
    fetchSubmissions();
  }, [selectedExam]);

  // Filter submissions based on search and filter status
  useEffect(() => {
    let filtered = [...submissions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by approval status
    if (filterStatus === 'approved') {
      filtered = filtered.filter(sub => sub.isApproved === true);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(sub => sub.isApproved === false);
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, filterStatus, submissions]);

  const handleApprove = async (submissionId) => {
    setApprovingIds(prev => new Set(prev).add(submissionId));
    try {
      await submissionService.approveSubmission(submissionId);
      
      // Update local state
      setSubmissions(prevSubmissions =>
        prevSubmissions.map(sub =>
          sub.id === submissionId ? { ...sub, isApproved: true } : sub
        )
      );
      
      console.log('Submission approved successfully:', submissionId);
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Không thể phê duyệt bài nộp. Vui lòng thử lại!');
    } finally {
      setApprovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const handleApproveAll = async () => {
    if (!window.confirm(`Bạn có chắc muốn phê duyệt tất cả ${filteredSubmissions.filter(s => !s.isApproved).length} bài nộp?`)) {
      return;
    }

    const pendingSubmissions = filteredSubmissions.filter(sub => !sub.isApproved);
    
    for (const submission of pendingSubmissions) {
      await handleApprove(submission.id);
    }
    
    alert('Đã phê duyệt tất cả bài nộp thành công!');
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? `${exam.subject?.subjectCode || ''} - ${exam.examName}` : 'N/A';
  };

  const approvedCount = filteredSubmissions.filter(s => s.isApproved).length;
  const pendingCount = filteredSubmissions.filter(s => !s.isApproved).length;

  return (
    <div className="approval-management">
      <div className="approval-header">
        <div>
          <h1>Phê duyệt bài nộp</h1>
          <p>Phê duyệt bài nộp để xuất báo cáo Excel</p>
        </div>
      </div>

      {/* Exam Selection */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Chọn kỳ thi:</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={isLoadingExams}
            className="exam-select"
          >
            <option value="">-- Chọn kỳ thi --</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.subject?.subjectCode || 'N/A'} - {exam.examName} ({exam.semester?.semesterCode || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <>
            <div className="filter-group">
              <label>Tìm kiếm:</label>
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc MSSV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Lọc theo trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">Tất cả</option>
                <option value="approved">Đã phê duyệt</option>
                <option value="pending">Chờ phê duyệt</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Statistics */}
      {selectedExam && filteredSubmissions.length > 0 && (
        <div className="approval-stats">
          <div className="stat-card approved">
            <CheckCircle size={24} />
            <div>
              <h3>{approvedCount}</h3>
              <p>Đã phê duyệt</p>
            </div>
          </div>
          <div className="stat-card pending">
            <AlertCircle size={24} />
            <div>
              <h3>{pendingCount}</h3>
              <p>Chờ phê duyệt</p>
            </div>
          </div>
          <div className="stat-card total">
            <Filter size={24} />
            <div>
              <h3>{filteredSubmissions.length}</h3>
              <p>Tổng số</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedExam && pendingCount > 0 && (
        <div className="bulk-actions">
          <button
            onClick={handleApproveAll}
            className="btn btn-success"
            disabled={approvingIds.size > 0}
          >
            <CheckCircle size={18} />
            Phê duyệt tất cả ({pendingCount})
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Submissions List */}
      {isLoadingSubmissions ? (
        <div className="loading-container">
          <Loader2 size={48} className="spinner" />
          <p>Đang tải danh sách bài nộp...</p>
        </div>
      ) : !selectedExam ? (
        <div className="empty-state">
          <AlertCircle size={64} />
          <h3>Chọn kỳ thi</h3>
          <p>Vui lòng chọn kỳ thi để xem danh sách bài nộp</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={64} />
          <h3>Không có bài nộp</h3>
          <p>Kỳ thi này chưa có bài nộp nào</p>
        </div>
      ) : (
        <div className="submissions-table-container">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>MSSV</th>
                <th>Tên sinh viên</th>
                <th>File</th>
                <th>Tổng điểm</th>
                <th>Trạng thái chấm</th>
                <th>Trạng thái duyệt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => (
                <tr key={submission.id} className={submission.isApproved ? 'approved-row' : ''}>
                  <td>{index + 1}</td>
                  <td><strong>{submission.studentId}</strong></td>
                  <td>{submission.student?.fullName || 'N/A'}</td>
                  <td className="file-cell">{submission.originalFileName}</td>
                  <td>
                    {submission.totalScore !== null ? (
                      <span className={`score ${submission.totalScore >= 5 ? 'pass' : 'fail'}`}>
                        {submission.totalScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="no-score">Chưa chấm</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${submission.gradingStatus?.toLowerCase()}`}>
                      {submission.gradingStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {submission.isApproved ? (
                      <span className="approval-badge approved">
                        <CheckCircle size={16} />
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="approval-badge pending">
                        <AlertCircle size={16} />
                        Chờ duyệt
                      </span>
                    )}
                  </td>
                  <td>
                    {!submission.isApproved && (
                      <button
                        onClick={() => handleApprove(submission.id)}
                        disabled={approvingIds.has(submission.id)}
                        className="btn btn-sm btn-approve"
                      >
                        {approvingIds.has(submission.id) ? (
                          <>
                            <Loader2 size={14} className="spinner" />
                            Đang duyệt...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            Phê duyệt
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ApprovalManagement;
