import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Save, CheckCircle, 
  AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import mammoth from 'mammoth';
import * as criteriaService from '../services/criteriaService';
import gradeService from '../services/gradeService';
import submissionService from '../services/submissionService';
import examService from '../services/examService';
import subjectService from '../services/subjectService';
import violationService from '../services/violationService';
import './GradingPage.css';

function GradingPage({ user, onLogout, exams, setExams, subjects }) {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  
  // Exam state - fetch from backend
  const [exam, setExam] = useState(null);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [examError, setExamError] = useState(null);
  
  // Subject state - fetch from backend
  const [subject, setSubject] = useState(null);
  
  // Submissions from backend
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState(null);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [isLoadingSubmissionDetail, setIsLoadingSubmissionDetail] = useState(false);
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
  const [isLoadingViolation, setIsLoadingViolation] = useState(false);
  const [violationError, setViolationError] = useState(null);

  // Fetch exam from backend when component mounts
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      
      setIsLoadingExam(true);
      setExamError(null);
      
      try {
        const fetchedExam = await examService.getExamById(examId);
        setExam(fetchedExam);
        
        // Fetch subject info
        if (fetchedExam.subjectId) {
          try {
            const fetchedSubject = await subjectService.getSubjectById(fetchedExam.subjectId);
            setSubject(fetchedSubject);
          } catch (error) {
            console.error('Error fetching subject:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        setExamError('Không thể tải thông tin bài thi.');
      } finally {
        setIsLoadingExam(false);
      }
    };
    
    fetchExam();
  }, [examId]);

  // Fetch submissions from backend when exam is loaded
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!exam || !user.id) return;
      
      setIsLoadingSubmissions(true);
      setSubmissionsError(null);
      
      try {
        const fetchedSubmissions = await submissionService.getSubmissionsByExamAndExaminer(exam.id, user.id);
        
        // Map submissions to student format for UI compatibility
        const studentsFromSubmissions = fetchedSubmissions.map(sub => ({
          id: sub.id,
          studentId: sub.studentId,
          studentName: sub.studentId, // Will be updated from backend later if needed
          fileName: sub.originalFileName,
          fileUrl: sub.filePath,
          uploadedAt: sub.uploadedAt,
          totalScore: sub.totalScore,
          gradingStatus: sub.gradingStatus,
          graded: sub.gradingStatus === 'Passed' || sub.gradingStatus === 'Failed',
          grades: sub.grades || [],
          violations: sub.violations || [],
          _submission: sub
        }));
        
        setSubmissions(studentsFromSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissionsError('Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch b\u00e0i n\u1ed9p.');
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
    
    fetchSubmissions();
  }, [exam, user.id]);

  // Auto-select submission when submissionId is in URL
  useEffect(() => {
    if (submissionId && submissions.length > 0) {
      const submission = submissions.find(s => s.id === submissionId);
      console.log('Auto-loading submission from URL:', submissionId);
      console.log('Found submission:', submission);
      
      if (submission) {
        // Only load if different from current or if no submissionDetail
        if (!selectedStudent || selectedStudent.id !== submissionId || !submissionDetail) {
          console.log('Loading submission detail...');
          loadSubmissionDetail(submission);
        }
      }
    } else if (!submissionId && selectedStudent) {
      // If no submissionId in URL but have selectedStudent, clear it
      console.log('No submissionId in URL, clearing selected student');
      setSelectedStudent(null);
      setSubmissionDetail(null);
    }
  }, [submissionId, submissions]);

  // Extract handleSelectStudent logic into reusable function
  const loadSubmissionDetail = async (student) => {
    console.log('=== Loading submission detail for student:', student.id);
    
    // IMPORTANT: Reset ALL state first to ensure clean slate
    setSelectedStudent(student);
    setSubmissionDetail(null);
    setIsLoadingSubmissionDetail(true);
    
    // Reset grading state - these will be re-populated if grades exist
    setScores({});
    setNotes({});
    setAddedCriteria({});
    setGradeIds({});
    
    // Reset violations and document
    setViolations([]);
    setDocumentContent('');
    
    // Fetch submission detail from backend
    if (student.id) {
      try {
        console.log('Fetching submission detail for ID:', student.id);
        const detail = await submissionService.getSubmissionById(student.id);
        console.log('Received submission detail:', detail);
        console.log('Number of existing grades:', detail?.grades?.length || 0);
        
        // Set submission detail first
        setSubmissionDetail(detail);
        
        // Pre-fill existing grades ONLY if they exist from backend
        if (detail.grades && detail.grades.length > 0) {
          const existingScores = {};
          const existingNotes = {};
          const existingGradeIds = {};
          const existingAdded = {};
          
          detail.grades.forEach(grade => {
            existingScores[grade.criteriaId] = grade.score;
            existingNotes[grade.criteriaId] = grade.note || '';
            existingGradeIds[grade.criteriaId] = grade.gradeId;
            existingAdded[grade.criteriaId] = true;
          });
          
          console.log('Pre-filling grades from backend:', existingScores);
          console.log('Grade IDs:', existingGradeIds);
          
          // Update states with existing grades
          setScores(existingScores);
          setNotes(existingNotes);
          setGradeIds(existingGradeIds);
          setAddedCriteria(existingAdded);
        } else {
          console.log('No existing grades - submission is fresh, keeping empty state');
          // Explicitly set to empty objects to ensure clean state
          setScores({});
          setNotes({});
          setGradeIds({});
          setAddedCriteria({});
        }
        
        // Pre-fill existing violations - map from backend format to UI format
        if (detail.violations && detail.violations.length > 0) {
          console.log('Raw violations from backend:', detail.violations);
          const mappedViolations = detail.violations.map(v => {
            console.log('Mapping violation:', v);
            return {
              id: v.violationId,
              submissionId: v.submissionId,
              type: v.type || v.violationType || v.Type, // Try multiple field names
              description: v.description || v.Description,
              penalty: v.penalty || v.Penalty,
              severity: v.severity || v.Severity,
              detectedAt: v.detectedAt || v.DetectedAt
            };
          });
          console.log('Mapped violations:', mappedViolations);
          setViolations(mappedViolations);
        } else {
          // Clear violations if submission has none
          console.log('No violations for this submission');
          setViolations([]);
        }
        
        // Load document from Cloudinary URL
        if (detail.filePath) {
          await loadDocumentFromUrl(detail.filePath);
        }
      } catch (error) {
        console.error('Error fetching submission detail:', error);
        alert('Không thể tải thông tin chi tiết bài nộp.');
      } finally {
        setIsLoadingSubmissionDetail(false);
      }
    }
  };

  // Load document from Cloudinary URL
  const loadDocumentFromUrl = async (fileUrl) => {
    if (!fileUrl) {
      setDocumentContent('');
      return;
    }

    setIsLoadingDocument(true);
    setDocumentContent('');
    
    try {
      // Fetch file from Cloudinary URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch document from URL');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
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
      console.log('Document loaded from URL. HTML length:', result.value.length);
    } catch (error) {
      console.error('Error loading document from URL:', error);
      setDocumentContent('<p style="color: red;">Kh\u00f4ng th\u1ec3 t\u1ea3i t\u00e0i li\u1ec7u. File c\u00f3 th\u1ec3 kh\u00f4ng t\u1ed3n t\u1ea1i ho\u1eb7c kh\u00f4ng ph\u1ea3i \u0111\u1ecbnh d\u1ea1ng .docx</p>');
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Load document content from Blob when student is selected (legacy support)
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
    console.log('[Criteria useEffect] Running, exam:', exam);
    console.log('[Criteria useEffect] exam.id:', exam?.id);
    
    const fetchCriteria = async () => {
      if (!exam) {
        console.log('[Criteria useEffect] No exam, skipping fetch');
        return;
      }
      
      if (!exam.id) {
        console.log('[Criteria useEffect] exam exists but no exam.id:', exam);
        return;
      }
      
      console.log('[Criteria useEffect] Starting fetch for exam ID:', exam.id);
      setIsLoadingCriteria(true);
      setCriteriaError(null);
      
      try {
        console.log('Fetching criteria for exam ID:', exam.id);
        console.log('Full exam object:', exam);
        // Fetch criteria uploaded by admin for this exam using dedicated endpoint
        const data = await criteriaService.getCriteriaByExamId(exam.id);
        console.log('Criteria API response:', data);
        console.log('Number of criteria:', data?.length);
        
        // If API returns empty, use fallback from exam.gradingCriteria
        if (!data || data.length === 0) {
          console.log('No criteria from API, using fallback');
          const fallbackCriteria = exam.gradingCriteria || [];
          if (fallbackCriteria.length === 0) {
            setCriteriaError('Chưa có tiêu chí chấm điểm. Vui lòng liên hệ admin để upload file tiêu chí.');
          }
          setCriteriaList(fallbackCriteria);
        } else {
          // Successfully got criteria from backend
          setCriteriaList(data);
          setCriteriaError(null);
        }
      } catch (error) {
        console.error('Error fetching criteria:', error);
        // On error, show error message AND use fallback criteria from exam
        const fallbackCriteria = exam.gradingCriteria || [];
        if (fallbackCriteria.length > 0) {
          setCriteriaError('Không thể tải tiêu chí từ server. Đang hiển thị dữ liệu dự phòng.');
          setCriteriaList(fallbackCriteria);
        } else {
          setCriteriaError('Không thể tải danh sách tiêu chí. Vui lòng thử lại sau.');
          setCriteriaList([]);
        }
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

  // Show loading state while fetching exam
  if (isLoadingExam) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Show error if exam fetch failed
  if (examError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{examError}</p>
        <button onClick={() => navigate('/teacher')} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  // Show not found if exam doesn't exist
  if (!exam) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Không tìm thấy bài thi</p>
        <button onClick={() => navigate('/teacher')} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  const handleSelectStudent = async (student) => {
    // Navigate to submission detail URL
    navigate(`/grading/${examId}/submission/${student.id}`);
    
    // Load submission detail
    await loadSubmissionDetail(student);
  };

  const handleAddCriteria = async (criteriaId) => {
    const score = scores[criteriaId];
    if (score === undefined || score === '') {
      alert('Vui lòng nhập điểm số trước khi Add!');
      return;
    }
    
    if (!selectedStudent || !submissionDetail) {
      alert('Vui lòng chọn sinh viên và đợi tải thông tin bài nộp!');
      return;
    }

    setLoadingCriteriaId(criteriaId);
    setGradeError(null);

    try {
      // Use submissionId from submission detail
      const submissionId = submissionDetail.submissionId;
      
      // Call API to create grade
      const gradeData = {
        submissionId: submissionId,
        criteriaId: criteriaId,
        score: parseFloat(score),
        note: notes[criteriaId] || ''
      };
      
      const response = await gradeService.createGrade(gradeData);
      
      // Store the grade ID and mark as added
      const updatedGradeIds = { ...gradeIds, [criteriaId]: response.gradeId };
      const updatedAddedCriteria = { ...addedCriteria, [criteriaId]: true };
      const updatedScores = { ...scores, [criteriaId]: parseFloat(score) };
      
      setGradeIds(updatedGradeIds);
      setAddedCriteria(updatedAddedCriteria);
      setScores(updatedScores);
      
      console.log('Grade created successfully:', response);
      console.log('Updated scores:', updatedScores);
      console.log('Current total score should be:', Object.keys(updatedAddedCriteria)
        .filter(key => updatedAddedCriteria[key])
        .reduce((sum, key) => sum + (updatedScores[key] || 0), 0));
    } catch (error) {
      console.error('Error creating grade:', error);
      setGradeError(`Không thể lưu điểm cho tiêu chí này. Vui lòng thử lại.`);
      alert('Không thể lưu điểm. Vui lòng thử lại!');
    } finally {
      setLoadingCriteriaId(null);
    }
  };

  const handleEditCriteria = (criteriaId) => {
    // Unlock the fields for editing by setting to false (not deleting)
    // This allows user to edit without removing from total score calculation
    setAddedCriteria({ ...addedCriteria, [criteriaId]: false });
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
      
      // Update local state after successful update
      const updatedScores = { ...scores, [criteriaId]: parseFloat(score) };
      const updatedAddedCriteria = { ...addedCriteria, [criteriaId]: true };
      
      setScores(updatedScores);
      setAddedCriteria(updatedAddedCriteria);
      
      console.log('Grade updated successfully');
      console.log('Updated scores:', updatedScores);
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
    
    // Allow empty string (user is typing)
    if (value === '' || value === null || value === undefined) {
      setScores({ ...scores, [criteriaId]: '' });
      return;
    }
    
    // Parse and validate number
    const numValue = parseFloat(value);
    
    // Allow valid numbers including 0, and check if it's a multiple of 0.25
    if (!isNaN(numValue) && numValue >= 0 && numValue <= criteria.maxScore) {
      // Check if the value is a multiple of 0.25 (step size)
      const remainder = (numValue * 100) % 25; // Multiply by 100 to avoid floating point issues
      if (remainder === 0) {
        setScores({ ...scores, [criteriaId]: numValue });
      }
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

  const handleAddViolation = async () => {
    if (!violationForm.description.trim()) {
      alert('Vui lòng nhập mô tả vi phạm!');
      return;
    }

    if (!submissionDetail) {
      alert('Vui lòng đợi tải thông tin bài nộp!');
      return;
    }

    setIsLoadingViolation(true);
    setViolationError(null);

    try {
      console.log('Creating violation with submissionDetail:', submissionDetail);
      console.log('SubmissionId:', submissionDetail?.submissionId);
      console.log('ViolationForm:', violationForm);
      
      if (!submissionDetail?.submissionId) {
        alert('Lỗi: Không tìm thấy submissionId. Vui lòng chọn lại submission.');
        return;
      }
      
      const violationData = {
        submissionId: submissionDetail.submissionId,
        type: violationForm.type,
        description: violationForm.description,
        severity: violationForm.severity,
        penalty: getPenaltyByType(violationForm.type),
        detectedBy_UserID: user.id // Add current user ID
      };
      
      console.log('Sending violation data:', violationData);
      console.log('Request will be sent to:', '/api/v1/violation');

      const newViolation = await violationService.createViolation(violationData);
      
      // Add to local state
      setViolations([...violations, newViolation]);
      handleCloseViolationForm();
      
      console.log('Violation created successfully:', newViolation);
    } catch (error) {
      console.error('Error creating violation:', error);
      setViolationError('Không thể tạo vi phạm. Vui lòng thử lại.');
      alert('Không thể tạo vi phạm. Vui lòng thử lại!');
    } finally {
      setIsLoadingViolation(false);
    }
  };

  const handleEditViolation = (violation) => {
    console.log('Editing violation:', violation);
    setEditingViolation(violation.id);
    setViolationForm({
      type: violation.type || 'Keyword', // Fallback to default
      description: violation.description || '',
      severity: violation.severity || 'Warning'
    });
    setShowViolationForm(true);
    console.log('Form set to:', {
      type: violation.type || 'Keyword',
      description: violation.description || '',
      severity: violation.severity || 'Warning'
    });
  };

  const handleUpdateViolation = async () => {
    if (!violationForm.description.trim()) {
      alert('Vui lòng nhập mô tả vi phạm!');
      return;
    }

    setIsLoadingViolation(true);
    setViolationError(null);

    try {
      console.log('Updating violation, form data:', violationForm);
      
      const violationData = {
        submissionId: submissionDetail.submissionId, // Add SubmissionId from current submission
        type: violationForm.type,
        description: violationForm.description,
        severity: violationForm.severity,
        penalty: getPenaltyByType(violationForm.type),
        detectedBy_UserID: user.id, // Add current user ID
        resolved: false // Default to not resolved
      };
      
      console.log('Sending violation data:', violationData);

      const updatedViolation = await violationService.updateViolation(editingViolation, violationData);
      
      // Update local state
      setViolations(violations.map(v => 
        v.id === editingViolation ? updatedViolation : v
      ));
      handleCloseViolationForm();
      
      console.log('Violation updated successfully:', updatedViolation);
    } catch (error) {
      console.error('Error updating violation:', error);
      setViolationError('Không thể cập nhật vi phạm. Vui lòng thử lại.');
      alert('Không thể cập nhật vi phạm. Vui lòng thử lại!');
    } finally {
      setIsLoadingViolation(false);
    }
  };

  const handleDeleteViolation = async (violationId) => {
    if (!window.confirm('Bạn có chắc muốn xóa vi phạm này?')) {
      return;
    }

    setIsLoadingViolation(true);
    setViolationError(null);

    try {
      await violationService.deleteViolation(violationId);
      
      // Remove from local state
      setViolations(violations.filter(v => v.id !== violationId));
      
      console.log('Violation deleted successfully');
    } catch (error) {
      console.error('Error deleting violation:', error);
      setViolationError('Không thể xóa vi phạm. Vui lòng thử lại.');
      alert('Không thể xóa vi phạm. Vui lòng thử lại!');
    } finally {
      setIsLoadingViolation(false);
    }
  };

  const getTotalPenalty = () => {
    return violations.reduce((sum, v) => sum + v.penalty, 0);
  };

  const calculateTotalScore = () => {
    // Calculate score for criteria that have been saved to DB (have gradeId)
    let baseScore = 0;
    activeCriteria.forEach(criteria => {
      // Count criteria that have gradeId (saved to DB) OR have been added but not yet updated
      if (gradeIds[criteria.id] && scores[criteria.id] !== undefined) {
        baseScore += parseFloat(scores[criteria.id]);
      }
    });
    
    const penalty = getTotalPenalty();
    console.log('[calculateTotalScore] Base score:', baseScore, 'Penalty:', penalty);
    return Math.max(0, baseScore - penalty);
  };

  const handleSubmitGrade = async () => {
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

    try {
      setIsLoadingGrade(true);
      
      // Prepare update data
      const updateData = {
        ExamId: submissionDetail?.examId || exam?.id,
        StudentId: submissionDetail?.studentId || selectedStudent?.studentId
      };
      
      // Call backend to update submission - backend will calculate TotalScore and GradingStatus automatically
      await submissionService.updateSubmission(selectedStudent.id, updateData);

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
      
      // Update submissions state to reflect graded status immediately
      const finalScore = calculateTotalScore();
      setSubmissions(submissions.map(s => 
        s.id === selectedStudent.id 
          ? { 
              ...s, 
              graded: true, 
              totalScore: finalScore,
              gradingStatus: finalScore > 0 ? 'Passed' : 'Failed'
            }
          : s
      ));
      
      // Update student as graded in the exams state
      setExams(exams.map(e => {
        if (e.id === exam.id) {
          return {
            ...e,
            students: e.students.map(s => 
              s.id === selectedStudent.id 
                ? { ...s, graded: true, totalScore: finalScore }
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
    } catch (error) {
      console.error('Error completing grading:', error);
      alert('Có lỗi xảy ra khi hoàn thành chấm bài. Vui lòng thử lại!');
    } finally {
      setIsLoadingGrade(false);
    }
  };

  const handlePreviousFile = () => {
    const currentIndex = submissions.findIndex(s => s.id === selectedStudent?.id) || 0;
    if (currentIndex > 0) {
      const prevStudent = submissions[currentIndex - 1];
      handleSelectStudent(prevStudent);
    }
  };

  const handleNextFile = () => {
    const currentIndex = submissions.findIndex(s => s.id === selectedStudent?.id) || 0;
    if (currentIndex < submissions.length - 1) {
      const nextStudent = submissions[currentIndex + 1];
      handleSelectStudent(nextStudent);
    }
  };

  // Use criteria from API (uploaded by admin), fallback to exam.gradingCriteria for backward compatibility
  const activeCriteria = criteriaList.length > 0 ? criteriaList : (exam.gradingCriteria || []);
  const totalMaxScore = activeCriteria.reduce((sum, c) => sum + (c.maxScore || 0), 0);

  return (
    <div className="grading-page">
      <div className="grading-header">
        <button 
          onClick={() => {
              navigate('/teacher');           
          }} 
          className="btn btn-secondary"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <div className="header-info">
          <h1>
            {exam?.subject?.subjectCode || subject?.code || 'N/A'} - {exam?.subject?.subjectName || subject?.name || ''}
          </h1>
          <p>
            {exam?.examName || exam?.semester || 'N/A'} ({exam?.examType || exam?.type || 'N/A'})
            {exam?.semester?.semesterName && ` - ${exam.semester.semesterName}`}
          </p>
        </div>
      </div>

      <div className="grading-container">
        {/* Student List */}
        {!selectedStudent ? (
          <div className="student-list-section">
            <div className="section-header">
              <h2>Danh sách sinh viên ({submissions.length})</h2>
              <div className="grading-stats">
                <span className="stat-badge graded">
                  Đã chấm: {submissions.filter(s => s.graded).length}
                </span>
                <span className="stat-badge pending">
                  Chưa chấm: {submissions.filter(s => !s.graded).length}
                </span>
              </div>
            </div>
            
            {isLoadingSubmissions ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách bài nộp...</p>
              </div>
            ) : submissionsError ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#e53e3e' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 10px' }} />
                <p>{submissionsError}</p>
              </div>
            ) : submissions.length > 0 ? (
              <div className="student-grid">
                {submissions.map((student) => (
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
                      <h3>{student.student?.fullName || student.studentName || student.studentId}</h3>
                      <p className="student-id">MSSV: {student.student?.studentId || student.studentId}</p>
                      <p className="student-file">{student.originalFileName || student.fileName}</p>
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
                    onClick={() => {
                      setSelectedStudent(null);
                      setSubmissionDetail(null);
                      navigate(`/grading/${examId}`, { replace: true });
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <ArrowLeft size={16} />
                    Quay lại danh sách
                  </button>
                </div>
                <div className="student-details">
                  <div className="detail-row">
                    <span className="detail-label">Tên sinh viên:</span>
                    <span className="detail-value">
                      {submissionDetail?.student?.fullName || selectedStudent.studentName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">MSSV:</span>
                    <span className="detail-value">
                      {submissionDetail?.student?.studentId || selectedStudent.studentId}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Môn thi:</span>
                    <span className="detail-value">
                      {submissionDetail?.exam?.subject?.subjectCode || subject?.code || 'N/A'} - {submissionDetail?.exam?.subject?.subjectName || subject?.name || ''}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tên kỳ thi:</span>
                    <span className="detail-value">
                      {submissionDetail?.exam?.examName || exam.semester}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Loại thi:</span>
                    <span className="detail-value">
                      {submissionDetail?.exam?.examType || exam.type}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Kỳ học:</span>
                    <span className="detail-value">
                      {submissionDetail?.exam?.semester?.semesterCode || exam.semester} 
                      {submissionDetail?.exam?.semester?.semesterName && ` - ${submissionDetail.exam.semester.semesterName}`}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">File:</span>
                    <span className="detail-value file-name">
                      {submissionDetail?.originalFileName || selectedStudent.fileName}
                    </span>
                  </div>
                  {submissionDetail && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Thời gian nộp:</span>
                        <span className="detail-value">
                          {new Date(submissionDetail.uploadedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Trạng thái chấm:</span>
                        <span className="detail-value">
                          <span className={`status-badge ${submissionDetail.gradingStatus.toLowerCase()}`}>
                            {submissionDetail.gradingStatus}
                          </span>
                        </span>
                      </div>
                      {submissionDetail.totalScore !== null && (
                        <div className="detail-row">
                          <span className="detail-label">Tổng điểm:</span>
                          <span className="detail-value">
                            <strong style={{ fontSize: '18px', color: submissionDetail.totalScore >= 5 ? '#38a169' : '#e53e3e' }}>
                              {submissionDetail.totalScore.toFixed(1)}
                            </strong>
                          </span>
                        </div>
                      )}
                      {submissionDetail.isApproved && (
                        <div className="detail-row">
                          <span className="detail-label">Phê duyệt:</span>
                          <span className="detail-value">
                            <CheckCircle size={16} style={{ color: '#38a169', marginRight: '4px' }} />
                            Đã phê duyệt
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* File Navigation */}
              <div className="file-navigation">
                <button
                  onClick={handlePreviousFile}
                  disabled={(submissions.findIndex(s => s.id === selectedStudent.id) || 0) === 0}
                  className="btn btn-secondary"
                >
                  <ChevronLeft size={18} />
                  Sinh viên trước
                </button>
                <span className="file-counter">
                  {(submissions.findIndex(s => s.id === selectedStudent.id) || 0) + 1} / {submissions.length}
                </span>
                <button
                  onClick={handleNextFile}
                  disabled={(submissions.findIndex(s => s.id === selectedStudent.id) || 0) === submissions.length - 1}
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
                  {submissionDetail && (
                    <div style={{ fontSize: '12px', color: '#666', marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      {/* {submissionDetail.totalScore && (
                        <div>Tổng điểm: <strong>{submissionDetail.totalScore.toFixed(1)}</strong></div>
                      )} */}
                      <a 
                        href={submissionDetail.filePath} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 12px' }}
                      >
                        📥 Tải file gốc
                      </a>
                    </div>
                  )}
                </div>
                {isLoadingSubmissionDetail ? (
                  <div className="document-placeholder">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin bài nộp...</p>
                  </div>
                ) : isLoadingDocument ? (
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
                      {calculateTotalScore()} / {totalMaxScore}
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
                            step="0.25"
                            value={scores[criteria.id] !== undefined && scores[criteria.id] !== null ? scores[criteria.id] : ''}
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
                  Hoàn thành chấm bài
                </button>
              </div>

              {/* Graded Submissions */}
              {/* {gradedSubmissions.length > 0 && (
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
              )} */}
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
                              disabled={isLoadingViolation}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteViolation(violation.id)}
                              className="btn-violation-action btn-delete-small"
                              disabled={isLoadingViolation}
                            >
                              {isLoadingViolation ? 'Đang xóa...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {violations.length > 0 && (
                      <div className="violation-summary" style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', borderRadius: '8px' }}>
                        <strong>Tổng cộng:</strong> {violations.length} vi phạm, Tổng điểm trừ: <strong style={{ color: '#e53e3e' }}>-{getTotalPenalty()} điểm</strong>
                      </div>
                    )}
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

            {violationError && (
              <div style={{ padding: '12px', background: '#fee', color: '#c00', borderRadius: '6px', marginTop: '16px' }}>
                {violationError}
              </div>
            )}

            <div className="modal-footer">
              <button 
                onClick={handleCloseViolationForm} 
                className="btn btn-secondary"
                disabled={isLoadingViolation}
              >
                Hủy
              </button>
              <button 
                onClick={editingViolation ? handleUpdateViolation : handleAddViolation}
                className="btn btn-warning"
                disabled={isLoadingViolation}
              >
                {isLoadingViolation ? (
                  <>
                    <div className="spinner-small" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {editingViolation ? 'Cập nhật' : 'Thêm vi phạm'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
