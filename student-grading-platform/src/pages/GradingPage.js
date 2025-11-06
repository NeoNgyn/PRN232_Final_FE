import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Save, CheckCircle, 
  AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import './GradingPage.css';

// Mock data
const mockExamData = {
  1: {
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
  },
};

function GradingPage({ user, onLogout }) {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = mockExamData[examId];
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [gradedSubmissions, setGradedSubmissions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!exam) {
    return <div>Exam not found</div>;
  }

  // Parse filename: Support multiple formats
  // Format 1: SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572.docx (đầy đủ)
  // Format 2: SWD392_PE_SU25_SE184696_NguyenPhucNhan.docx (ngắn gọn)
  const parseFileName = (fileName) => {
    const cleanName = fileName.replace('.docx', '').replace('.doc', '');
    const parts = cleanName.split('_');
    
    // Format 1: SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572
    if (parts.length >= 7 && parts[3].match(/^\d+$/)) {
      return {
        subject: parts[0],
        semester: parts[1],
        examType: parts[2],
        slot: parseInt(parts[3]),
        password: parts[4],
        studentName: parts.slice(5, parts.length - 1).join(' '),
        studentId: parts[parts.length - 1],
      };
    }
    
    // Format 2: SWD392_PE_SU25_SE184696_NguyenPhucNhan
    if (parts.length >= 4) {
      let studentIdIndex = -1;
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i].match(/^(SE|HE|SS|HS|GD|AI)\d+$/i)) {
          studentIdIndex = i;
          break;
        }
      }
      
      if (studentIdIndex !== -1) {
        let semester = '';
        let examType = '';
        
        if (parts[1].match(/^(PE|FE|TE)$/i)) {
          examType = parts[1].toUpperCase();
          semester = parts[2];
        } else if (parts[2].match(/^(PE|FE|TE)$/i)) {
          semester = parts[1];
          examType = parts[2].toUpperCase();
        }
        
        let nameStartIndex = 3;
        const studentName = parts.slice(nameStartIndex, studentIdIndex).join(' ');
        
        return {
          subject: parts[0],
          semester: semester,
          examType: examType,
          slot: 1,
          password: '000000',
          studentName: studentName || 'Unknown',
          studentId: parts[studentIdIndex],
        };
      }
    }
    
    return null;
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setScores({});
    setNotes({});
  };

  const handleScoreChange = (criteriaId, value) => {
    const criteria = exam.gradingCriteria.find(c => c.id === criteriaId);
    const numValue = parseFloat(value);
    
    if (numValue <= criteria.maxScore && numValue >= 0) {
      setScores({ ...scores, [criteriaId]: numValue });
    }
  };

  const handleNoteChange = (criteriaId, value) => {
    setNotes({ ...notes, [criteriaId]: value });
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  };

  const handleSubmitGrade = () => {
    if (!selectedStudent) {
      alert('Vui lòng chọn sinh viên để chấm điểm!');
      return;
    }

    // Check if all criteria are scored
    const allScored = exam.gradingCriteria.every(c => scores[c.id] !== undefined);
    if (!allScored) {
      alert('Vui lòng chấm điểm đầy đủ tất cả các tiêu chí!');
      return;
    }

    const gradingResult = {
      studentId: selectedStudent.studentId,
      studentName: selectedStudent.studentName,
      subject: exam.subject.code,
      semester: exam.semester,
      examType: exam.type,
      password: selectedStudent.password,
      scores: { ...scores },
      notes: { ...notes },
      totalScore: calculateTotalScore(),
      gradedAt: new Date().toLocaleString('vi-VN'),
      gradedBy: user.name,
    };

    setGradedSubmissions([...gradedSubmissions, gradingResult]);
    
    // Update student as graded
    const updatedStudents = exam.students.map(s => 
      s.id === selectedStudent.id 
        ? { ...s, graded: true, totalScore: calculateTotalScore() }
        : s
    );
    exam.students = updatedStudents;
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedStudent(null);
      setScores({});
      setNotes({});
    }, 2000);
  };

  const handlePreviousFile = () => {
    const currentIndex = exam.students.findIndex(s => s.id === selectedStudent?.id);
    if (currentIndex > 0) {
      setSelectedStudent(exam.students[currentIndex - 1]);
      setScores({});
      setNotes({});
    }
  };

  const handleNextFile = () => {
    const currentIndex = exam.students.findIndex(s => s.id === selectedStudent?.id);
    if (currentIndex < exam.students.length - 1) {
      setSelectedStudent(exam.students[currentIndex + 1]);
      setScores({});
      setNotes({});
    }
  };

  const totalMaxScore = exam.gradingCriteria.reduce((sum, c) => sum + c.maxScore, 0);

  return (
    <div className="grading-page">
      <div className="grading-header">
        <button onClick={() => navigate('/teacher')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <div className="header-info">
          <h1>{exam.subject.code} - {exam.semester} ({exam.type})</h1>
          <p>{exam.subject.name}</p>
        </div>
      </div>

      <div className="grading-container">
        {/* Student List */}
        {!selectedStudent ? (
          <div className="student-list-section">
            <div className="section-header">
              <h2>Danh sách sinh viên ({exam.students?.length || 0})</h2>
              <div className="grading-stats">
                <span className="stat-badge graded">
                  Đã chấm: {exam.students?.filter(s => s.graded).length || 0}
                </span>
                <span className="stat-badge pending">
                  Chưa chấm: {exam.students?.filter(s => !s.graded).length || 0}
                </span>
              </div>
            </div>
            
            {exam.students && exam.students.length > 0 ? (
              <div className="student-grid">
                {exam.students.map((student) => (
                  <div 
                    key={student.id} 
                    className={`student-card ${student.graded ? 'graded' : ''}`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="student-card-header">
                      <FileText size={32} />
                      {student.graded && (
                        <CheckCircle size={20} className="graded-icon" />
                      )}
                    </div>
                    <div className="student-card-body">
                      <h3>{student.studentName}</h3>
                      <p className="student-id">{student.studentId}</p>
                      <p className="student-file">{student.fileName}</p>
                      {student.graded && (
                        <div className="student-score">
                          Điểm: <strong>{student.totalScore?.toFixed(1)}/{totalMaxScore}</strong>
                        </div>
                      )}
                    </div>
                    <div className="student-card-footer">
                      <button className="btn btn-primary btn-sm">
                        {student.graded ? 'Xem chi tiết' : 'Chấm điểm'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <AlertCircle size={64} />
                <h3>Chưa có bài nộp</h3>
                <p>Admin chưa upload bài làm của sinh viên cho kỳ thi này</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grading-workspace">
            {/* Left Panel - Student Info & Document */}
            <div className="left-panel">
              <div className="card student-info-card">
                <div className="card-header">
                  <FileText size={24} />
                  <h3>Thông tin sinh viên</h3>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    <ArrowLeft size={16} />
                    Quay lại danh sách
                  </button>
                </div>
                <div className="student-details">
                  <div className="detail-row">
                    <span className="detail-label">Tên sinh viên:</span>
                    <span className="detail-value">{selectedStudent.studentName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">MSSV:</span>
                    <span className="detail-value">{selectedStudent.studentId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Môn thi:</span>
                    <span className="detail-value">{exam.subject.code}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Kỳ thi:</span>
                    <span className="detail-value">{exam.semester}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Loại thi:</span>
                    <span className="detail-value">{exam.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Slot:</span>
                    <span className="detail-value">{exam.slot}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Password:</span>
                    <span className="detail-value password">{selectedStudent.password}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">File:</span>
                    <span className="detail-value file-name">{selectedStudent.fileName}</span>
                  </div>
                </div>
              </div>

              {/* File Navigation */}
              <div className="file-navigation">
                <button
                  onClick={handlePreviousFile}
                  disabled={exam.students.findIndex(s => s.id === selectedStudent.id) === 0}
                  className="btn btn-secondary"
                >
                  <ChevronLeft size={18} />
                  Sinh viên trước
                </button>
                <span className="file-counter">
                  {exam.students.findIndex(s => s.id === selectedStudent.id) + 1} / {exam.students.length}
                </span>
                <button
                  onClick={handleNextFile}
                  disabled={exam.students.findIndex(s => s.id === selectedStudent.id) === exam.students.length - 1}
                  className="btn btn-secondary"
                >
                  Sinh viên sau
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="card document-viewer">
                <div className="card-header">
                  <FileText size={24} />
                  <h3>Bài làm sinh viên</h3>
                </div>
                <div className="document-placeholder">
                  <FileText size={48} />
                  <p>Xem bài làm trong file:</p>
                  <p className="file-name">{selectedStudent.fileName}</p>
                  <p className="note">
                    (Trong môi trường thực tế, bài làm sẽ được hiển thị ở đây)
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - Grading Criteria */}
            <div className="right-panel">
              <div className="card grading-card">
                <div className="card-header">
                  <h3>Tiêu chí chấm điểm</h3>
                  <div className="total-score">
                    <span>Tổng điểm:</span>
                    <span className="score-display">
                      {calculateTotalScore().toFixed(1)} / {totalMaxScore}
                    </span>
                  </div>
                </div>

                <div className="criteria-list">
                  {exam.gradingCriteria.map((criteria) => (
                    <div key={criteria.id} className="criteria-item">
                      <div className="criteria-header">
                        <h4>{criteria.name}</h4>
                        <span className="max-score">Max: {criteria.maxScore} điểm</span>
                      </div>
                      {criteria.description && (
                        <p className="criteria-description">{criteria.description}</p>
                      )}
                      
                      <div className="criteria-inputs">
                        <div className="input-group">
                          <label>Điểm số:</label>
                          <input
                            type="number"
                            min="0"
                            max={criteria.maxScore}
                            step="0.5"
                            value={scores[criteria.id] || ''}
                            onChange={(e) => handleScoreChange(criteria.id, e.target.value)}
                            placeholder={`0 - ${criteria.maxScore}`}
                          />
                        </div>
                        
                        <div className="input-group">
                          <label>Ghi chú:</label>
                          <textarea
                            value={notes[criteria.id] || ''}
                            onChange={(e) => handleNoteChange(criteria.id, e.target.value)}
                            placeholder="Nhập ghi chú cho tiêu chí này..."
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmitGrade}
                  className="btn btn-success btn-submit"
                >
                  <Save size={20} />
                  Lưu điểm
                </button>
              </div>

              {/* Graded Submissions */}
              {gradedSubmissions.length > 0 && (
                <div className="card graded-list">
                  <div className="card-header">
                    <h3>Đã chấm ({gradedSubmissions.length})</h3>
                  </div>
                  <div className="graded-items">
                    {gradedSubmissions.map((submission, index) => (
                      <div key={index} className="graded-item">
                        <div className="graded-info">
                          <strong>{submission.studentName}</strong>
                          <span>{submission.studentId}</span>
                        </div>
                        <div className="graded-score">
                          {submission.totalScore.toFixed(1)} điểm
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message">
            <CheckCircle size={64} />
            <h2>Đã lưu điểm thành công!</h2>
            <p>Điểm số đã được lưu vào hệ thống</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
