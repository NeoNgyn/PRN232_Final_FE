import React, { useState, useEffect } from 'react';
import { LogOut, Users, Upload, Archive, FileCheck, AlertCircle, Loader2, CheckCircle, XCircle, Settings, AlertTriangle } from 'lucide-react';
import managerService from '../services/managerService';
import ManagementPanel from './ManagementPanel';
import ViolationManagement from './ViolationManagement';
import './ManagerDashboard.css';

function ManagerDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('assignments'); // assignments, management, or violations
  const [teachers, setTeachers] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [teachersError, setTeachersError] = useState(null);
  const [examsError, setExamsError] = useState(null);
  const [uploadingTeacher, setUploadingTeacher] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
    fetchExams();
  }, []);

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    setTeachersError(null);
    try {
      const fetchedTeachers = await managerService.getAllTeachers();
      setTeachers(fetchedTeachers);
    } catch (error) {
      setTeachersError('Không thể tải danh sách giảng viên. Vui lòng thử lại.');
      console.error('Error fetching teachers:', error);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const fetchExams = async () => {
    setIsLoadingExams(true);
    setExamsError(null);
    try {
      const fetchedExams = await managerService.getAllExams();
      setExams(fetchedExams);
    } catch (error) {
      setExamsError('Không thể tải danh sách kỳ thi. Vui lòng thử lại.');
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const handleOpenUploadModal = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedExam('');
    setSelectedFile(null);
    setUploadProgress(null);
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    if (uploadingTeacher) return; // Prevent closing while uploading
    setShowUploadModal(false);
    setSelectedTeacher(null);
    setSelectedExam('');
    setSelectedFile(null);
    setUploadProgress(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.rar') || fileName.endsWith('.zip')) {
        setSelectedFile(file);
      } else {
        alert('Vui lòng chọn file RAR hoặc ZIP');
        e.target.value = '';
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExam || !selectedFile || !selectedTeacher) {
      alert('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    setUploadingTeacher(selectedTeacher.userId);
    setUploadProgress({ status: 'uploading', message: 'Đang tải file lên...' });

    try {
      const result = await managerService.uploadRarFile(
        selectedFile,
        selectedExam,
        selectedTeacher.userId
      );

      setUploadProgress({
        status: 'success',
        message: 'Upload thành công!',
        SWD392_PE_SU25_SE184696_NguyenPhucNhandata: result.data
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        handleCloseUploadModal();
        setUploadingTeacher(null);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({
        status: 'error',
        message: error.response?.data?.message || 'Upload thất bại. Vui lòng thử lại.',
        errors: error.response?.data?.data?.errors
      });
      setUploadingTeacher(null);
    }
  };

  return (
    <div className="manager-dashboard">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <Users size={28} />
            <span>Manager Dashboard</span>
          </div>
          <div className="nav-actions">
            <button 
              className={`nav-tab ${activeView === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveView('assignments')}
            >
              <FileCheck size={18} />
              Phân công chấm bài
            </button>
            <button 
              className={`nav-tab ${activeView === 'violations' ? 'active' : ''}`}
              onClick={() => setActiveView('violations')}
            >
              <AlertTriangle size={18} />
              Quản lý vi phạm
            </button>
            <button 
              className={`nav-tab ${activeView === 'management' ? 'active' : ''}`}
              onClick={() => setActiveView('management')}
            >
              <Settings size={18} />
              Quản lý dữ liệu
            </button>
          </div>
          <div className="nav-user">
            <span>Xin chào, {user.name}</span>
            <button onClick={onLogout} className="btn btn-secondary">
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      {activeView === 'management' ? (
        <ManagementPanel />
      ) : activeView === 'violations' ? (
        <ViolationManagement user={user} onLogout={onLogout} />
      ) : (
      <div className="dashboard-content">
        <div className="content-header">
          <h1>Quản lý phân công chấm bài</h1>
          <p>Assign file RAR chứa bài nộp của sinh viên cho giảng viên</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon teachers-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{teachers.length}</h3>
              <p>Giảng viên</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon exams-icon">
              <FileCheck size={24} />
            </div>
            <div className="stat-info">
              <h3>{exams.length}</h3>
              <p>Kỳ thi</p>
            </div>
          </div>
        </div>

        {/* Teachers List */}
        <div className="teachers-section">
          <div className="section-header">
            <h2>Danh sách giảng viên</h2>
            {teachersError && (
              <div className="error-banner">
                <AlertCircle size={18} />
                <span>{teachersError}</span>
              </div>
            )}
          </div>

          {isLoadingTeachers ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={48} />
              <p>Đang tải danh sách giảng viên...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="empty-state">
              <Users size={64} />
              <h3>Chưa có giảng viên</h3>
              <p>Danh sách giảng viên đang trống</p>
            </div>
          ) : (
            <div className="teachers-grid">
              {teachers.map((teacher) => (
                <div key={teacher.userId} className="teacher-card">
                  <div className="teacher-header">
                    <div className="teacher-avatar">
                      <Users size={32} />
                    </div>
                    <div className="teacher-info">
                      <h3>{teacher.name}</h3>
                      <p className="teacher-code">{teacher.lecturerCode}</p>
                      <p className="teacher-email">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="teacher-footer">
                    <button
                      className="btn btn-primary btn-assign"
                      onClick={() => handleOpenUploadModal(teacher)}
                      disabled={uploadingTeacher === teacher.userId}
                    >
                      {uploadingTeacher === teacher.userId ? (
                        <>
                          <Loader2 className="spinner" size={18} />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Assign bài chấm
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={handleCloseUploadModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign bài chấm cho giảng viên</h3>
              <button className="btn-close" onClick={handleCloseUploadModal} disabled={uploadingTeacher}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {uploadProgress ? (
                <div className={`upload-result ${uploadProgress.status}`}>
                  {uploadProgress.status === 'uploading' && (
                    <>
                      <Loader2 className="spinner" size={48} />
                      <p>{uploadProgress.message}</p>
                    </>
                  )}
                  {uploadProgress.status === 'success' && (
                    <>
                      <CheckCircle size={48} />
                      <p>{uploadProgress.message}</p>
                      {uploadProgress.data && (
                        <div className="upload-details">
                          <p><strong>Tổng file:</strong> {uploadProgress.data.totalFiles}</p>
                          <p><strong>Thành công:</strong> {uploadProgress.data.successfulSubmissions}</p>
                          <p><strong>Thất bại:</strong> {uploadProgress.data.failedFiles}</p>
                        </div>
                      )}
                    </>
                  )}
                  {uploadProgress.status === 'error' && (
                    <>
                      <XCircle size={48} />
                      <p>{uploadProgress.message}</p>
                      {uploadProgress.errors && uploadProgress.errors.length > 0 && (
                        <div className="error-details">
                          <h4>Chi tiết lỗi:</h4>
                          <ul>
                            {uploadProgress.errors.map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit}>
                  <div className="form-group">
                    <label>Giảng viên:</label>
                    <input
                      type="text"
                      value={selectedTeacher?.name || ''}
                      disabled
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Chọn kỳ thi:</label>
                    <select
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                      required
                      className="form-control"
                      disabled={isLoadingExams}
                    >
                      <option value="">-- Chọn kỳ thi --</option>
                      {exams.map((exam) => (
                        <option key={exam.examId} value={exam.examId}>
                          {exam.examName || `Exam ${exam.examType || ''}`}
                        </option>
                      ))}
                    </select>
                    {examsError && (
                      <span className="error-text">{examsError}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Upload file RAR/ZIP:</label>
                    <input
                      type="file"
                      accept=".rar,.zip"
                      onChange={handleFileChange}
                      required
                      className="form-control"
                    />
                    {selectedFile && (
                      <div className="file-info">
                        <Archive size={16} />
                        <span>{selectedFile.name}</span>
                        <span className="file-size">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                    <p className="help-text">
                      File RAR/ZIP phải chứa các file DOC/DOCX với tên theo định dạng: SE123456_TenSinhVien.docx
                    </p>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseUploadModal}
                      disabled={uploadingTeacher}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!selectedExam || !selectedFile || uploadingTeacher}
                    >
                      {uploadingTeacher ? (
                        <>
                          <Loader2 className="spinner" size={18} />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload & Assign
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;
