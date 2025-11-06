import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, ClipboardList, FileText } from 'lucide-react';
import './TeacherDashboard.css';

function TeacherDashboard({ user, onLogout, exams, subjects }) {
  const navigate = useNavigate();
  
  // Filter exams assigned to this teacher (mock: teacher id = 2)
  const assignedExams = exams.filter(exam => exam.teacherId === user.id);

  const handleStartGrading = (examId) => {
    navigate(`/grading/${examId}`);
  };

  const calculateProgress = (exam) => {
    const submittedStudents = exam.students?.length || 0;
    const gradedStudents = exam.students?.filter(s => s.graded).length || 0;
    if (submittedStudents === 0) return 0;
    return Math.round((gradedStudents / submittedStudents) * 100);
  };

  return (
    <div className="teacher-dashboard">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <BookOpen size={28} />
            <span>Teacher Dashboard</span>
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

      <div className="dashboard-content">
        <div className="content-header">
          <h1>Môn thi được phân công</h1>
          <p>Quản lý và chấm bài thi của sinh viên</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon exams-icon">
              <ClipboardList size={24} />
            </div>
            <div className="stat-info">
              <h3>{assignedExams.length}</h3>
              <p>Kỳ thi được giao</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon students-icon">
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <h3>{assignedExams.reduce((sum, e) => sum + (e.students?.length || 0), 0)}</h3>
              <p>Tổng bài nộp</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon graded-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <h3>{assignedExams.reduce((sum, e) => sum + (e.students?.filter(s => s.graded).length || 0), 0)}</h3>
              <p>Đã chấm xong</p>
            </div>
          </div>
        </div>

        {/* Assigned Exams */}
        <div className="exams-grid">
          {assignedExams.map((exam) => {
            const progress = calculateProgress(exam);
            const subject = subjects.find(s => s.id === exam.subjectId);
            const submittedStudents = exam.students?.length || 0;
            const gradedStudents = exam.students?.filter(s => s.graded).length || 0;
            
            return (
              <div key={exam.id} className="exam-card">
                <div className="exam-header">
                  <div className="exam-badge">{exam.type}</div>
                  <div className="exam-semester">{exam.semester}</div>
                </div>
                
                <div className="exam-body">
                  <h3>{subject?.code || 'N/A'}</h3>
                  <p className="exam-name">{subject?.name || 'N/A'}</p>
                  <p className="exam-slot">Slot {exam.slot}</p>
                  
                  <div className="exam-stats">
                    <div className="stat-item">
                      <span className="stat-label">Tiêu chí chấm:</span>
                      <span className="stat-value">{exam.gradingCriteria?.length || 0} tiêu chí</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tổng điểm:</span>
                      <span className="stat-value">
                        {exam.gradingCriteria?.reduce((sum, c) => sum + c.maxScore, 0) || 0} điểm
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Bài nộp:</span>
                      <span className="stat-value">{submittedStudents} bài</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Đã chấm:</span>
                      <span className="stat-value">{gradedStudents} bài</span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Tiến độ chấm bài</span>
                      <span className="progress-percent">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="exam-footer">
                  <button
                    onClick={() => handleStartGrading(exam.id)}
                    className="btn btn-primary btn-grade"
                  >
                    <ClipboardList size={18} />
                    Vào chấm bài
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
