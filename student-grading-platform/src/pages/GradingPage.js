import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, FileText, Save, CheckCircle, 
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
    gradingCriteria: [
      { id: 1, name: 'Thiết kế kiến trúc hệ thống', maxScore: 2, description: 'Đánh giá khả năng thiết kế kiến trúc' },
      { id: 2, name: 'Code quality và convention', maxScore: 2, description: 'Đánh giá chất lượng code' },
      { id: 3, name: 'Implement features', maxScore: 3, description: 'Triển khai các tính năng' },
      { id: 4, name: 'Database design', maxScore: 2, description: 'Thiết kế cơ sở dữ liệu' },
      { id: 5, name: 'Documentation', maxScore: 1, description: 'Tài liệu hướng dẫn' },
    ],
  },
};

// Mock graded submissions
const initialGradedSubmissions = [];

function GradingPage({ user, onLogout }) {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = mockExamData[examId];
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [gradedSubmissions, setGradedSubmissions] = useState(initialGradedSubmissions);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!exam) {
    return <div>Exam not found</div>;
  }

  const parseFileName = (fileName) => {
    // Format: SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572.docx
    const parts = fileName.replace('.docx', '').replace('.doc', '').split('_');
    if (parts.length >= 7) {
      return {
        subject: parts[0],
        semester: parts[1],
        examType: parts[2],
        slot: parts[3],
        password: parts[4],
        studentName: parts.slice(5, parts.length - 1).join(' '),
        studentId: parts[parts.length - 1],
      };
    }
    return null;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const parsedFiles = files.map((file) => {
      const info = parseFileName(file.name);
      return {
        file,
        info,
        fileName: file.name,
      };
    });
    setUploadedFiles(parsedFiles);
    setCurrentFileIndex(0);
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
    const currentFile = uploadedFiles[currentFileIndex];
    if (!currentFile || !currentFile.info) {
      alert('Thông tin file không hợp lệ!');
      return;
    }

    // Check if all criteria are scored
    const allScored = exam.gradingCriteria.every(c => scores[c.id] !== undefined);
    if (!allScored) {
      alert('Vui lòng chấm điểm đầy đủ tất cả các tiêu chí!');
      return;
    }

    const gradingResult = {
      studentId: currentFile.info.studentId,
      studentName: currentFile.info.studentName,
      subject: currentFile.info.subject,
      semester: currentFile.info.semester,
      examType: currentFile.info.examType,
      password: currentFile.info.password,
      scores: { ...scores },
      notes: { ...notes },
      totalScore: calculateTotalScore(),
      gradedAt: new Date().toLocaleString('vi-VN'),
      gradedBy: user.name,
    };

    setGradedSubmissions([...gradedSubmissions, gradingResult]);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      // Move to next file if available
      if (currentFileIndex < uploadedFiles.length - 1) {
        setCurrentFileIndex(currentFileIndex + 1);
        setScores({});
        setNotes({});
      }
    }, 2000);
  };

  const handlePreviousFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
      setScores({});
      setNotes({});
    }
  };

  const handleNextFile = () => {
    if (currentFileIndex < uploadedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      setScores({});
      setNotes({});
    }
  };

  const currentFile = uploadedFiles[currentFileIndex];
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
        {/* Upload Section */}
        {uploadedFiles.length === 0 ? (
          <div className="upload-section">
            <div className="upload-card">
              <Upload size={64} />
              <h2>Upload bài làm sinh viên</h2>
              <p>Chọn các file bài làm để bắt đầu chấm điểm</p>
              <p className="file-format">
                Format tên file: SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572.docx
              </p>
              <input
                type="file"
                multiple
                accept=".doc,.docx"
                onChange={handleFileUpload}
                className="file-input-hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn btn-primary btn-upload">
                <Upload size={20} />
                Chọn file
              </label>
            </div>
          </div>
        ) : (
          <div className="grading-workspace">
            {/* Left Panel - Student Info & Document */}
            <div className="left-panel">
              <div className="card student-info-card">
                <div className="card-header">
                  <FileText size={24} />
                  <h3>Thông tin sinh viên</h3>
                </div>
                {currentFile && currentFile.info ? (
                  <div className="student-details">
                    <div className="detail-row">
                      <span className="detail-label">Tên sinh viên:</span>
                      <span className="detail-value">{currentFile.info.studentName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">MSSV:</span>
                      <span className="detail-value">{currentFile.info.studentId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Môn thi:</span>
                      <span className="detail-value">{currentFile.info.subject}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Kỳ thi:</span>
                      <span className="detail-value">{currentFile.info.semester}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Loại thi:</span>
                      <span className="detail-value">{currentFile.info.examType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Password:</span>
                      <span className="detail-value password">{currentFile.info.password}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">File:</span>
                      <span className="detail-value file-name">{currentFile.fileName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="alert-warning">
                    <AlertCircle size={20} />
                    <span>Tên file không đúng định dạng!</span>
                  </div>
                )}
              </div>

              {/* File Navigation */}
              <div className="file-navigation">
                <button
                  onClick={handlePreviousFile}
                  disabled={currentFileIndex === 0}
                  className="btn btn-secondary"
                >
                  <ChevronLeft size={18} />
                  Bài trước
                </button>
                <span className="file-counter">
                  {currentFileIndex + 1} / {uploadedFiles.length}
                </span>
                <button
                  onClick={handleNextFile}
                  disabled={currentFileIndex === uploadedFiles.length - 1}
                  className="btn btn-secondary"
                >
                  Bài sau
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
                  <p className="file-name">{currentFile?.fileName}</p>
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
                  disabled={!currentFile?.info}
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
