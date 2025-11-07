import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Save, CheckCircle, 
  AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import mammoth from 'mammoth';
import './GradingPage.css';

function GradingPage({ user, onLogout, exams, setExams, subjects }) {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = exams.find(e => e.id === parseInt(examId));
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [gradedSubmissions, setGradedSubmissions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [compareDocumentContent, setCompareDocumentContent] = useState('');
  const [isLoadingCompareDocument, setIsLoadingCompareDocument] = useState(false);
  const [similarityScore, setSimilarityScore] = useState(null);

  // Load document content from Blob when student is selected
  const loadDocumentContent = async (student) => {
    if (!student || !student.fileBlob) {
      setDocumentContent('');
      return;
    }

    setIsLoadingDocument(true);
    setDocumentContent('');
    
    try {
      const arrayBuffer = await student.fileBlob.arrayBuffer();
      
      // Options for mammoth conversion
      const options = {
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer,
              alt: image.altText || "Image"
            };
          }).catch(function(err) {
            console.error('Error converting image:', err);
            return {
              src: "",
              alt: "[Image could not be loaded]"
            };
          });
        }),
        styleMap: [
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2",
          "p[style-name='Heading 3'] => h3",
          "b => strong",
          "i => em"
        ]
      };
      
      // Convert to HTML with images and styling
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      
      setDocumentContent(result.value);
      
      // Log conversion info
      console.log('Document loaded. HTML length:', result.value.length);
      if (result.messages && result.messages.length > 0) {
        console.log('Conversion messages:', result.messages);
      }
    } catch (error) {
      console.error('Error reading document:', error);
      setDocumentContent('<p style="color: #e53e3e;">Không thể đọc nội dung file. Vui lòng kiểm tra định dạng file.</p>');
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Load document when selected student changes
  useEffect(() => {
    if (selectedStudent) {
      loadDocumentContent(selectedStudent);
    } else {
      setDocumentContent('');
      setCompareDocumentContent('');
      setSimilarityScore(null);
    }
  }, [selectedStudent]);

  // Function to calculate text similarity (Jaccard similarity)
  const calculateSimilarity = (text1, text2) => {
    // Remove HTML tags
    const cleanText1 = text1.replace(/<[^>]*>/g, ' ').toLowerCase();
    const cleanText2 = text2.replace(/<[^>]*>/g, ' ').toLowerCase();
    
    // Split into words
    const words1 = cleanText1.split(/\s+/).filter(w => w.length > 3);
    const words2 = cleanText2.split(/\s+/).filter(w => w.length > 3);
    
    // Create sets
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    // Calculate intersection
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    // Calculate union
    const union = new Set([...set1, ...set2]);
    
    // Jaccard similarity
    const similarity = (intersection.size / union.size) * 100;
    
    return Math.round(similarity);
  };

  // Handle compare document upload
  const handleCompareFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoadingCompareDocument(true);
    setCompareDocumentContent('');
    setSimilarityScore(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const options = {
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer,
              alt: image.altText || "Image"
            };
          }).catch(function(err) {
            console.error('Error converting image:', err);
            return {
              src: "",
              alt: "[Image could not be loaded]"
            };
          });
        }),
        styleMap: [
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2",
          "p[style-name='Heading 3'] => h3",
          "b => strong",
          "i => em"
        ]
      };
      
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      setCompareDocumentContent(result.value);
      
      // Calculate similarity
      if (documentContent && result.value) {
        const similarity = calculateSimilarity(documentContent, result.value);
        setSimilarityScore(similarity);
      }
    } catch (error) {
      console.error('Error reading compare document:', error);
      alert('Không thể đọc file so sánh. Vui lòng kiểm tra định dạng file.');
    } finally {
      setIsLoadingCompareDocument(false);
    }
  };

  const clearCompareDocument = () => {
    setCompareDocumentContent('');
    setSimilarityScore(null);
  };

  if (!exam) {
    return <div>Exam not found</div>;
  }

  // Get subject info
  const subject = subjects.find(s => s.id === exam.subjectId);

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
      subject: subject?.code || 'N/A',
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
    
    // Update student as graded in the exams state
    setExams(exams.map(e => {
      if (e.id === exam.id) {
        return {
          ...e,
          students: e.students.map(s => 
            s.id === selectedStudent.id 
              ? { ...s, graded: true, totalScore: calculateTotalScore() }
              : s
          )
        };
      }
      return e;
    }));
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedStudent(null);
      setScores({});
      setNotes({});
    }, 2000);
  };

  const handlePreviousFile = () => {
    const currentIndex = exam.students?.findIndex(s => s.id === selectedStudent?.id) || 0;
    if (currentIndex > 0) {
      setSelectedStudent(exam.students[currentIndex - 1]);
      setScores({});
      setNotes({});
    }
  };

  const handleNextFile = () => {
    const currentIndex = exam.students?.findIndex(s => s.id === selectedStudent?.id) || 0;
    if (currentIndex < (exam.students?.length || 0) - 1) {
      setSelectedStudent(exam.students[currentIndex + 1]);
      setScores({});
      setNotes({});
    }
  };

  const totalMaxScore = exam.gradingCriteria?.reduce((sum, c) => sum + c.maxScore, 0) || 0;

  return (
    <div className="grading-page">
      <div className="grading-header">
        <button onClick={() => navigate('/teacher')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <div className="header-info">
          <h1>{subject?.code || 'N/A'} - {exam.semester} ({exam.type})</h1>
          <p>{subject?.name || 'N/A'}</p>
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
            {/* Top Section - Student Info */}
            <div className="top-section">
              <div className="card student-info-card">
                <div className="card-header">
                  <div className="header-left">
                    <FileText size={24} />
                    <h3>Thông tin sinh viên</h3>
                  </div>
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
                    <span className="detail-value">{subject?.code || 'N/A'}</span>
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
                    <span className="detail-label">File:</span>
                    <span className="detail-value file-name">{selectedStudent.fileName}</span>
                  </div>
                </div>
              </div>

              {/* File Navigation */}
              <div className="file-navigation">
                <button
                  onClick={handlePreviousFile}
                  disabled={(exam.students?.findIndex(s => s.id === selectedStudent.id) || 0) === 0}
                  className="btn btn-secondary"
                >
                  <ChevronLeft size={18} />
                  Sinh viên trước
                </button>
                <span className="file-counter">
                  {(exam.students?.findIndex(s => s.id === selectedStudent.id) || 0) + 1} / {exam.students?.length || 0}
                </span>
                <button
                  onClick={handleNextFile}
                  disabled={(exam.students?.findIndex(s => s.id === selectedStudent.id) || 0) === (exam.students?.length || 0) - 1}
                  className="btn btn-secondary"
                >
                  Sinh viên sau
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Bottom Section - Document & Grading Side by Side */}
            <div className="bottom-section">
              {/* Left Panel - Document Viewer */}
              <div className="left-panel">
                <div className="card document-viewer">
                <div className="card-header">
                  <FileText size={24} />
                  <h3>Bài làm sinh viên</h3>
                </div>
                {isLoadingDocument ? (
                  <div className="document-placeholder">
                    <div className="loading-spinner"></div>
                    <p>Đang tải nội dung file...</p>
                  </div>
                ) : documentContent ? (
                  <div className="document-content">
                    <div className="document-meta">
                      <FileText size={16} />
                      <span>{selectedStudent.fileName}</span>
                    </div>
                    <div 
                      className="document-text"
                      dangerouslySetInnerHTML={{ __html: documentContent }}
                    />
                  </div>
                ) : (
                  <div className="document-placeholder">
                    <FileText size={48} />
                    <p>Không có nội dung để hiển thị</p>
                    <p className="note">
                      File có thể trống hoặc định dạng không được hỗ trợ
                    </p>
                  </div>
                )}
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

            {/* Plagiarism Checker - Full Width Below */}
            <div className="plagiarism-section">
              <div className="card plagiarism-checker">
                <div className="card-header">
                  <FileText size={24} />
                  <h3>So sánh độ trùng</h3>
                </div>
                <div className="plagiarism-content">
                  {!compareDocumentContent ? (
                    <div className="upload-compare">
                      <p className="upload-instruction">Upload file để so sánh với bài làm hiện tại</p>
                      <input
                        type="file"
                        accept=".doc,.docx"
                        onChange={handleCompareFileUpload}
                        className="file-input-hidden"
                        id="compare-file-input"
                      />
                      <label htmlFor="compare-file-input" className="btn btn-primary">
                        <FileText size={18} />
                        Chọn file so sánh
                      </label>
                      {isLoadingCompareDocument && (
                        <div className="loading-text">
                          <div className="loading-spinner-small"></div>
                          <span>Đang tải file...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="comparison-result">
                      <div className="similarity-header">
                        <div className="similarity-score-container">
                          <div className="similarity-score-circle">
                            <span className={`similarity-percentage ${parseFloat(similarityScore) > 50 ? 'high' : parseFloat(similarityScore) > 30 ? 'medium' : 'low'}`}>
                              {similarityScore}%
                            </span>
                          </div>
                          <div className="similarity-info">
                            <h4>Độ trùng lặp</h4>
                            <p className={`similarity-status ${parseFloat(similarityScore) > 50 ? 'high' : parseFloat(similarityScore) > 30 ? 'medium' : 'low'}`}>
                              {parseFloat(similarityScore) > 50 ? 'Cao - Cần kiểm tra' : parseFloat(similarityScore) > 30 ? 'Trung bình - Cảnh báo' : 'Thấp - An toàn'}
                            </p>
                          </div>
                        </div>
                        <button onClick={clearCompareDocument} className="btn btn-secondary btn-sm">
                          Xóa file so sánh
                        </button>
                      </div>
                      
                      <div className="comparison-single-view">
                        <div className="comparison-column-header">
                          <FileText size={18} />
                          <h4>File so sánh</h4>
                        </div>
                        <div className="comparison-document-preview">
                          <div 
                            className="comparison-document-text"
                            dangerouslySetInnerHTML={{ __html: compareDocumentContent }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
