import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, ClipboardList, FileText } from 'lucide-react';
import './TeacherDashboard.css';

// Mock data - kỳ thi được assign cho giáo viên
const mockAssignedExams = [
  {
    id: 1,
    subject: { code: 'SWD392', name: 'Software Architecture and Design' },
    semester: 'SU25',
    type: 'PE',
    slot: 1,
    gradingCriteria: [
      { id: 1, name: 'Thiết kế kiến trúc hệ thống', maxScore: 2, description: 'Đánh giá khả năng thiết kế kiến trúc' },
      { id: 2, name: 'Code quality và convention', maxScore: 2, description: 'Đánh giá chất lượng code' },
      { id: 3, name: 'Implement features', maxScore: 3, description: 'Triển khai các tính năng' },
      { id: 4, name: 'Database design', maxScore: 2, description: 'Thiết kế cơ sở dữ liệu' },
      { id: 5, name: 'Documentation', maxScore: 1, description: 'Tài liệu hướng dẫn' },
    ],
    students: [
      {
        id: 1,
        studentId: 'SE161572',
        studentName: 'Vu Trung Tin',
        password: '358715',
        fileName: 'SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572.docx',
        uploadedAt: new Date().toISOString(),
        graded: false
      },
      {
        id: 2,
        studentId: 'SE161573',
        studentName: 'Nguyen Van A',
        password: '358716',
        fileName: 'SWD392_SU25_PE_1_358716_Nguyen Van A_SE161573.docx',
        uploadedAt: new Date().toISOString(),
        graded: true,
        totalScore: 8.5
      },
      {
        id: 3,
        studentId: 'SE184696',
        studentName: 'NguyenPhucNhan',
        password: '000000',
        fileName: 'SWD392_PE_SU25_SE184696_NguyenPhucNhan.docx',
        uploadedAt: new Date().toISOString(),
        graded: false
      },
      {
        id: 4,
        studentId: 'SE184557',
        studentName: 'MaiHaiNam',
        password: '000000',
        fileName: 'SWD392_PE_SU25_SE184557_MaiHaiNam.docx',
        uploadedAt: new Date().toISOString(),
        graded: false
      },
    ],
    submittedStudents: 4,
    gradedStudents: 1,
  },
  {
    id: 2,
    subject: { code: 'PRN231', name: 'Building Cross-Platform Applications' },
    semester: 'SU25',
    type: 'PE',
    slot: 2,
    gradingCriteria: [
      { id: 1, name: 'UI/UX Design', maxScore: 2.5, description: 'Giao diện người dùng' },
      { id: 2, name: 'API Integration', maxScore: 2.5, description: 'Tích hợp API' },
      { id: 3, name: 'State Management', maxScore: 2, description: 'Quản lý state' },
      { id: 4, name: 'Performance', maxScore: 2, description: 'Hiệu năng ứng dụng' },
      { id: 5, name: 'Code Structure', maxScore: 1, description: 'Cấu trúc code' },
    ],
    students: [],
    submittedStudents: 0,
    gradedStudents: 0,
  },
];

function TeacherDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [assignedExams] = useState(mockAssignedExams);

  const handleStartGrading = (examId) => {
    navigate(`/grading/${examId}`);
  };

  const calculateProgress = (exam) => {
    if (exam.submittedStudents === 0) return 0;
    return Math.round((exam.gradedStudents / exam.submittedStudents) * 100);
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
              <h3>{assignedExams.reduce((sum, e) => sum + e.submittedStudents, 0)}</h3>
              <p>Tổng bài nộp</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon graded-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <h3>{assignedExams.reduce((sum, e) => sum + e.gradedStudents, 0)}</h3>
              <p>Đã chấm xong</p>
            </div>
          </div>
        </div>

        {/* Assigned Exams */}
        <div className="exams-grid">
          {assignedExams.map((exam) => {
            const progress = calculateProgress(exam);
            return (
              <div key={exam.id} className="exam-card">
                <div className="exam-header">
                  <div className="exam-badge">{exam.type}</div>
                  <div className="exam-semester">{exam.semester}</div>
                </div>
                
                <div className="exam-body">
                  <h3>{exam.subject.code}</h3>
                  <p className="exam-name">{exam.subject.name}</p>
                  <p className="exam-slot">Slot {exam.slot}</p>
                  
                  <div className="exam-stats">
                    <div className="stat-item">
                      <span className="stat-label">Tiêu chí chấm:</span>
                      <span className="stat-value">{exam.gradingCriteria.length} tiêu chí</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tổng điểm:</span>
                      <span className="stat-value">
                        {exam.gradingCriteria.reduce((sum, c) => sum + c.maxScore, 0)} điểm
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Bài nộp:</span>
                      <span className="stat-value">{exam.submittedStudents} bài</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Đã chấm:</span>
                      <span className="stat-value">{exam.gradedStudents} bài</span>
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
