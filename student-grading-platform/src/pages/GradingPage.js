import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Save, CheckCircle, 
  AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import mammoth from 'mammoth';
import * as criteriaService from '../services/criteriaService';
import gradeService from '../services/gradeService';
import './GradingPage.css';

function GradingPage({ user, onLogout, exams, setExams, subjects }) {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = exams.find(e => e.id === parseInt(examId));
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [addedCriteria, setAddedCriteria] = useState({}); // Track which criteria have been added
  const [gradeIds, setGradeIds] = useState({}); // Track grade IDs for each criteria (for updates)
  const [gradedSubmissions, setGradedSubmissions] = useState([]);
  const [isLoadingGrade, setIsLoadingGrade] = useState(false);
  const [gradeError, setGradeError] = useState(null);
  const [loadingCriteriaId, setLoadingCriteriaId] = useState(null); // Track which criteria is being processed
  
  // Criteria list from API (uploaded by admin)
  const [criteriaList, setCriteriaList] = useState([]);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [criteriaError, setCriteriaError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [compareDocumentContent, setCompareDocumentContent] = useState('');
  const [isLoadingCompareDocument, setIsLoadingCompareDocument] = useState(false);
  const [similarityScore, setSimilarityScore] = useState(null);
  
  // Violation Report states
  const [violations, setViolations] = useState([]);
  const [showViolationForm, setShowViolationForm] = useState(false);
  const [editingViolation, setEditingViolation] = useState(null);
  const [violationForm, setViolationForm] = useState({
    type: 'Keyword',
    description: '',
    severity: 'Warning'
  });

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

  // Fetch criteria list from API (uploaded by admin for this exam)
  useEffect(() => {
    const fetchCriteria = async () => {
      if (!exam) return;
      
      setIsLoadingCriteria(true);
      setCriteriaError(null);
      
      try {
        console.log('Fetching criteria for exam ID:', exam.id);
        // Fetch criteria uploaded by admin for this exam
        const data = await criteriaService.getAllCriteria({ examId: exam.id });
        console.log('Criteria fetched successfully:', data);
        
        // If API returns empty, use fallback from exam.gradingCriteria
        if (!data || data.length === 0) {
          console.log('Using fallback criteria from exam.gradingCriteria');
          setCriteriaList(exam.gradingCriteria || []);
        } else {
          setCriteriaList(data);
        }
      } catch (error) {
        console.error('Error fetching criteria:', error);
        // On error, show error message AND use fallback criteria from exam
        console.log('Error occurred, using fallback criteria');
        // setCriteriaError('Không thể tải danh sách tiêu chí từ server. Đang hiển thị dữ liệu mẫu.');
        setCriteriaList(exam.gradingCriteria || []);
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    fetchCriteria();
  }, [exam]);

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
    setAddedCriteria({}); // Reset added criteria when switching students
    setGradeIds({}); // Reset grade IDs when switching students
  };

  const handleAddCriteria = async (criteriaId) => {
    const score = scores[criteriaId];
    if (score === undefined || score === '') {
      alert('Vui lòng nhập điểm số trước khi Add!');
      return;
    }
    
    if (!selectedStudent) {
      alert('Vui lòng chọn sinh viên trước!');
      return;
    }

    setLoadingCriteriaId(criteriaId);
    setGradeError(null);

    try {
      // Use submissionId from student object, fallback to student.id if not available
      const submissionId = selectedStudent.submissionId || selectedStudent.id;
      
      // Call API to create grade
      const gradeData = {
        submissionId: submissionId,
        criteriaId: criteriaId,
        score: parseFloat(score),
        note: notes[criteriaId] || ''
      };
      
      const response = await gradeService.createGrade(gradeData);
      
      // Store the grade ID for future updates
      setGradeIds({ ...gradeIds, [criteriaId]: response.gradeId });
      setAddedCriteria({ ...addedCriteria, [criteriaId]: true });
      
      console.log('Grade created successfully:', response);
    } catch (error) {
      console.error('Error creating grade:', error);
      setGradeError(`Không thể lưu điểm cho tiêu chí này. Vui lòng thử lại.`);
      alert('Không thể lưu điểm. Vui lòng thử lại!');
    } finally {
      setLoadingCriteriaId(null);
    }
  };

  const handleEditCriteria = (criteriaId) => {
    // Unlock the fields for editing by removing from addedCriteria
    const updatedAdded = { ...addedCriteria };
    delete updatedAdded[criteriaId];
    setAddedCriteria(updatedAdded);
  };

  const handleUpdateCriteria = async (criteriaId) => {
    const gradeId = gradeIds[criteriaId];
    
    if (!gradeId) {
      alert('Không tìm thấy ID điểm số. Vui lòng thử Add lại.');
      return;
    }

    const score = scores[criteriaId];
    if (score === undefined || score === '') {
      alert('Vui lòng nhập điểm số trước khi cập nhật!');
      return;
    }

    setLoadingCriteriaId(criteriaId);
    setGradeError(null);

    try {
      // Call API to update grade
      const gradeData = {
        score: parseFloat(score),
        note: notes[criteriaId] || ''
      };
      
      await gradeService.updateGrade(gradeId, gradeData);
      
      // Mark as added again after successful update
      setAddedCriteria({ ...addedCriteria, [criteriaId]: true });
      
      console.log('Grade updated successfully');
      alert('Cập nhật điểm thành công!');
    } catch (error) {
      console.error('Error updating grade:', error);
      setGradeError(`Không thể cập nhật điểm cho tiêu chí này. Vui lòng thử lại.`);
      alert('Không thể cập nhật điểm. Vui lòng thử lại!');
    } finally {
      setLoadingCriteriaId(null);
    }
  };

  const handleScoreChange = (criteriaId, value) => {
    const criteria = activeCriteria.find(c => c.id === criteriaId);
    if (!criteria) return;
    
    const numValue = parseFloat(value);
    
    if (numValue <= criteria.maxScore && numValue >= 0) {
      setScores({ ...scores, [criteriaId]: numValue });
    }
  };

  const handleNoteChange = (criteriaId, value) => {
    setNotes({ ...notes, [criteriaId]: value });
  };

  // Violation penalty mapping
  const getPenaltyByType = (type) => {
    const penalties = {
      'Keyword': 0.5,
      'LateSubmission': 1.0,
      'Plagiarism': 3.0,
      'FileError': 0.5
    };
    return penalties[type] || 0;
  };

  // Violation handlers
  const handleOpenViolationForm = () => {
    setShowViolationForm(true);
    setEditingViolation(null);
    setViolationForm({
      type: 'Keyword',
      description: '',
      severity: 'Warning'
    });
  };

  const handleCloseViolationForm = () => {
    setShowViolationForm(false);
    setEditingViolation(null);
    setViolationForm({
      type: 'Keyword',
      description: '',
      severity: 'Warning'
    });
  };

  const handleViolationFormChange = (field, value) => {
    setViolationForm({ ...violationForm, [field]: value });
  };

  const handleAddViolation = () => {
    if (!violationForm.description.trim()) {
      alert('Vui lòng nhập mô tả vi phạm!');
      return;
    }

    const newViolation = {
      id: Date.now(),
      ...violationForm,
      penalty: getPenaltyByType(violationForm.type)
    };

    setViolations([...violations, newViolation]);
    handleCloseViolationForm();
  };

  const handleEditViolation = (violation) => {
    setEditingViolation(violation.id);
    setViolationForm({
      type: violation.type,
      description: violation.description,
      severity: violation.severity
    });
    setShowViolationForm(true);
  };

  const handleUpdateViolation = () => {
    if (!violationForm.description.trim()) {
      alert('Vui lòng nhập mô tả vi phạm!');
      return;
    }

    setViolations(violations.map(v => 
      v.id === editingViolation 
        ? { ...v, ...violationForm, penalty: getPenaltyByType(violationForm.type) }
        : v
    ));
    handleCloseViolationForm();
  };

  const handleDeleteViolation = (violationId) => {
    if (window.confirm('Bạn có chắc muốn xóa vi phạm này?')) {
      setViolations(violations.filter(v => v.id !== violationId));
    }
  };

  const getTotalPenalty = () => {
    return violations.reduce((sum, v) => sum + v.penalty, 0);
  };

  const handleAddViolationList = async () => {
    if (violations.length === 0) {
      alert('Chưa có vi phạm nào để thêm!');
      return;
    }
    
    if (!selectedStudent) {
      alert('Vui lòng chọn sinh viên trước!');
      return;
    }

    const submissionId = selectedStudent.submissionId || selectedStudent.id;
    const totalPenalty = getTotalPenalty();
    
    // TODO: Call API to add all violations to database
    // Example API call structure:
    // const violationData = {
    //   submissionId: submissionId,
    //   violations: violations.map(v => ({
    //     type: v.type,
    //     description: v.description,
    //     severity: v.severity,
    //     penalty: v.penalty
    //   }))
    // };
    // await violationService.addViolationList(violationData);
    
    console.log('Ready to add violations for submissionId:', submissionId);
    console.log('Violations to add:', violations);
    console.log('Total penalty:', totalPenalty.toFixed(1));
    
    alert(`Sẽ thêm ${violations.length} vi phạm với tổng điểm trừ: ${totalPenalty.toFixed(1)} điểm (Chờ API)`);
  };

  const calculateTotalScore = () => {
    // Only calculate score for criteria that have been added
    let baseScore = 0;
    activeCriteria.forEach(criteria => {
      if (addedCriteria[criteria.id] && scores[criteria.id] !== undefined) {
        baseScore += scores[criteria.id];
      }
    });
    
    const penalty = getTotalPenalty();
    return Math.max(0, baseScore - penalty);
  };

  const handleSubmitGrade = () => {
    if (!selectedStudent) {
      alert('Vui lòng chọn sinh viên để chấm điểm!');
      return;
    }

    // Check if all criteria are scored
    const allScored = activeCriteria.every(c => scores[c.id] !== undefined);
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

  // Use criteria from API (uploaded by admin), fallback to exam.gradingCriteria for backward compatibility
  const activeCriteria = criteriaList.length > 0 ? criteriaList : (exam.gradingCriteria || []);
  const totalMaxScore = activeCriteria.reduce((sum, c) => sum + (c.maxScore || 0), 0);

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

                {gradeError && (
                  <div className="error-message" style={{margin: '16px 20px'}}>
                    <AlertCircle size={18} />
                    {gradeError}
                  </div>
                )}

                {isLoadingCriteria ? (
                  <div className="criteria-loading" style={{padding: '40px 20px', textAlign: 'center', color: '#718096'}}>
                    <div className="loading-spinner"></div>
                    <p style={{marginTop: '16px'}}>Đang tải danh sách tiêu chí...</p>
                  </div>
                ) : criteriaError ? (
                  <div className="criteria-error" style={{padding: '40px 20px', textAlign: 'center', color: '#e53e3e'}}>
                    <AlertCircle size={32} style={{marginBottom: '12px'}} />
                    <p>{criteriaError}</p>
                  </div>
                ) : activeCriteria.length === 0 ? (
                  <div className="criteria-loading" style={{padding: '40px 20px', textAlign: 'center', color: '#718096'}}>
                    <AlertCircle size={32} style={{marginBottom: '12px'}} />
                    <p>Chưa có tiêu chí chấm điểm cho kỳ thi này</p>
                    <p style={{fontSize: '14px', marginTop: '8px'}}>Admin cần upload file tiêu chí trước</p>
                  </div>
                ) : (
                <div className="criteria-list">
                  {activeCriteria.map((criteria) => (
                    <div key={criteria.id} className="criteria-item">
                      <div className="criteria-header">
                        <div className="criteria-title-group">
                          <h4>
                            {criteria.order && <span className="criteria-order">{criteria.order}. </span>}
                            {criteria.name}
                          </h4>
                          <span className="max-score">Max: {criteria.maxScore} điểm</span>
                        </div>
                        {addedCriteria[criteria.id] ? (
                          <button 
                            className="btn-criteria-action btn-edit"
                            onClick={() => handleEditCriteria(criteria.id)}
                            disabled={loadingCriteriaId === criteria.id}
                          >
                            Edit
                          </button>
                        ) : gradeIds[criteria.id] ? (
                          <button 
                            className="btn-criteria-action btn-update"
                            onClick={() => handleUpdateCriteria(criteria.id)}
                            disabled={loadingCriteriaId === criteria.id}
                          >
                            {loadingCriteriaId === criteria.id ? 'Loading...' : 'Update'}
                          </button>
                        ) : (
                          <button 
                            className="btn-criteria-action btn-add"
                            onClick={() => handleAddCriteria(criteria.id)}
                            disabled={loadingCriteriaId === criteria.id}
                          >
                            {loadingCriteriaId === criteria.id ? 'Loading...' : 'Add'}
                          </button>
                        )}
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
                            disabled={addedCriteria[criteria.id]}
                          />
                        </div>
                        
                        <div className="input-group">
                          <label>Ghi chú:</label>
                          <textarea
                            value={notes[criteria.id] || ''}
                            onChange={(e) => handleNoteChange(criteria.id, e.target.value)}
                            placeholder="Nhập ghi chú cho tiêu chí này..."
                            rows="2"
                            disabled={addedCriteria[criteria.id]}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}

                <button
                  onClick={handleSubmitGrade}
                  className="btn btn-success btn-submit"
                  disabled={loadingCriteriaId !== null}
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

            {/* Violation Report Section */}
            <div className="violation-section">
              <div className="card violation-card">
                <div className="card-header">
                  <div className="header-left">
                    <AlertCircle size={24} />
                    <h3>Báo cáo vi phạm</h3>
                  </div>
                  <button 
                    onClick={handleOpenViolationForm}
                    className="btn btn-warning"
                  >
                    <AlertCircle size={18} />
                    Thêm vi phạm
                  </button>
                </div>

                {violations.length > 0 ? (
                  <div className="violations-list">
                    {violations.map((violation) => (
                      <div key={violation.id} className={`violation-item severity-${violation.severity.toLowerCase()}`}>
                        <div className="violation-header">
                          <div className="violation-type-badge">{violation.type}</div>
                          <div className={`violation-severity severity-${violation.severity.toLowerCase()}`}>
                            {violation.severity}
                          </div>
                        </div>
                        <div className="violation-description">
                          {violation.description}
                        </div>
                        <div className="violation-footer">
                          <div className="violation-penalty">
                            Penalty: <strong>-{violation.penalty} điểm</strong>
                          </div>
                          <div className="violation-actions">
                            <button 
                              onClick={() => handleEditViolation(violation)}
                              className="btn-violation-action btn-edit-small"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteViolation(violation.id)}
                              className="btn-violation-action btn-delete-small"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="violation-total-action">
                      <button 
                        onClick={handleAddViolationList}
                        className="btn btn-warning"
                        style={{width: 'max-content', marginTop: '16px'}}
                      >
                        <Save size={18} />
                        Lưu vi phạm ({violations.length} vi phạm, -{getTotalPenalty().toFixed(1)} điểm)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-violations">
                    <AlertCircle size={48} />
                    <p>Chưa có vi phạm nào được ghi nhận</p>
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

      {/* Violation Form Modal */}
      {showViolationForm && (
        <div className="modal-overlay">
          <div className="modal-content violation-modal">
            <div className="modal-header">
              <h3>
                <AlertCircle size={20} />
                {editingViolation ? 'Chỉnh sửa vi phạm' : 'Thêm vi phạm mới'}
              </h3>
              <button onClick={handleCloseViolationForm} className="btn-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Loại vi phạm *</label>
                <select
                  value={violationForm.type}
                  onChange={(e) => handleViolationFormChange('type', e.target.value)}
                  className="modal-select"
                >
                  <option value="Keyword">Keyword</option>
                  <option value="LateSubmission">Late Submission</option>
                  <option value="Plagiarism">Plagiarism</option>
                  <option value="FileError">File Error</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mức độ nghiêm trọng *</label>
                <select
                  value={violationForm.severity}
                  onChange={(e) => handleViolationFormChange('severity', e.target.value)}
                  className="modal-select"
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả vi phạm *</label>
                <textarea
                  value={violationForm.description}
                  onChange={(e) => handleViolationFormChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về vi phạm..."
                  rows="4"
                  className="modal-textarea"
                />
              </div>

              <div className="penalty-display">
                <div className="penalty-info">
                  <AlertCircle size={20} />
                  <span>Điểm bị trừ:</span>
                </div>
                <span className="penalty-amount">-{getPenaltyByType(violationForm.type)} điểm</span>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseViolationForm} className="btn btn-secondary">
                Hủy
              </button>
              <button 
                onClick={editingViolation ? handleUpdateViolation : handleAddViolation}
                className="btn btn-warning"
              >
                <Save size={18} />
                {editingViolation ? 'Cập nhật' : 'Thêm vi phạm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
