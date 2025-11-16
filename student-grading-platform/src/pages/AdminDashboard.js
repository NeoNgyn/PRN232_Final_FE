import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Upload, BookOpen, Calendar, Users, FileSpreadsheet, Archive, FileText, AlertCircle, Loader2 } from 'lucide-react';
// import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import * as fileService from '../services/fileService';
import subjectService from '../services/subjectService';
import semesterService from '../services/semesterService';
import examService from '../services/examService';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout, subjects, setSubjects, exams, setExams, teachers, semesters, setSemesters }) {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [newSubject, setNewSubject] = useState({ code: '', name: '' });
  const [newSemester, setNewSemester] = useState({ code: '', name: '' });
  const [newExam, setNewExam] = useState({ 
    subjectId: '', 
    semester: '', 
    type: 'PE',
    slot: '',
    teacherId: '' 
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCriteria, setIsUploadingCriteria] = useState(false);
  const [criteriaError, setCriteriaError] = useState(null);
  const [isUploadingStudents, setIsUploadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [semestersError, setSemestersError] = useState(null);
  const [editingSemester, setEditingSemester] = useState(null);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examsError, setExamsError] = useState(null);
  const [editingExam, setEditingExam] = useState(null);

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setSubjectsError(null);
      try {
        const fetchedSubjects = await subjectService.getAllSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        setSubjectsError('Không thể tải danh sách môn học. Vui lòng thử lại.');
        console.error('Error fetching subjects:', error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [setSubjects]);

  // Fetch semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      setIsLoadingSemesters(true);
      setSemestersError(null);
      try {
        const fetchedSemesters = await semesterService.getAllSemesters();
        setSemesters(fetchedSemesters);
      } catch (error) {
        setSemestersError('Không thể tải danh sách học kỳ. Vui lòng thử lại.');
        console.error('Error fetching semesters:', error);
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [setSemesters]);

  // Fetch exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoadingExams(true);
      setExamsError(null);
      try {
        const fetchedExams = await examService.getAllExams();
        setExams(fetchedExams);
      } catch (error) {
        setExamsError('Không thể tải danh sách kỳ thi. Vui lòng thử lại.');
        console.error('Error fetching exams:', error);
      } finally {
        setIsLoadingExams(false);
      }
    };

    fetchExams();
  }, [setExams]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setShowSubjectModal(false);
    setIsLoadingSubjects(true);
    setSubjectsError(null);
    try {
      if (editingSubject) {
        // Update existing subject
        const updatedSubject = await subjectService.updateSubject(editingSubject.id, newSubject);
        setSubjects(subjects.map(s => s.id === editingSubject.id ? updatedSubject : s));
        setEditingSubject(null);
      } else {
        // Create new subject
        const createdSubject = await subjectService.createSubject(newSubject);
        setSubjects([...subjects, createdSubject]);
      }
      setNewSubject({ code: '', name: '' });
    } catch (error) {
      setSubjectsError(editingSubject ? 'Không thể cập nhật môn học. Vui lòng thử lại.' : 'Không thể thêm môn học. Vui lòng thử lại.');
      console.error('Error saving subject:', error);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setNewSubject({ code: subject.code, name: subject.name });
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      return;
    }
    setIsLoadingSubjects(true);
    setSubjectsError(null);
    try {
      await subjectService.deleteSubject(subjectId);
      setSubjects(subjects.filter(s => s.id !== subjectId));
    } catch (error) {
      setSubjectsError('Không thể xóa môn học. Vui lòng thử lại.');
      console.error('Error deleting subject:', error);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Semester CRUD handlers
  const handleAddSemester = async (e) => {
    e.preventDefault();
    setShowSemesterModal(false);
    setIsLoadingSemesters(true);
    setSemestersError(null);
    try {
      if (editingSemester) {
        // Update existing semester
        const updatedSemester = await semesterService.updateSemester(editingSemester.id, newSemester);
        setSemesters(semesters.map(s => s.id === editingSemester.id ? updatedSemester : s));
        setEditingSemester(null);
      } else {
        // Create new semester
        const createdSemester = await semesterService.createSemester(newSemester);
        setSemesters([...semesters, createdSemester]);
      }
      setNewSemester({ code: '', name: '' });
    } catch (error) {
      setSemestersError(editingSemester ? 'Không thể cập nhật học kỳ. Vui lòng thử lại.' : 'Không thể thêm học kỳ. Vui lòng thử lại.');
      console.error('Error saving semester:', error);
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  const handleEditSemester = (semester) => {
    setEditingSemester(semester);
    setNewSemester({ code: semester.code, name: semester.name });
    setShowSemesterModal(true);
  };

  const handleDeleteSemester = async (semesterId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học kỳ này?')) {
      return;
    }
    setIsLoadingSemesters(true);
    setSemestersError(null);
    try {
      await semesterService.deleteSemester(semesterId);
      setSemesters(semesters.filter(s => s.id !== semesterId));
    } catch (error) {
      setSemestersError('Không thể xóa học kỳ. Vui lòng thử lại.');
      console.error('Error deleting semester:', error);
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  // Exam CRUD handlers
  const handleAddExam = async (e) => {
    e.preventDefault();
    setShowExamModal(false);
    setIsLoadingExams(true);
    setExamsError(null);
    try {
      const examData = {
        subjectId: newExam.subjectId,
        semesterId: newExam.semesterId,
        examName: newExam.examName || `${newExam.type} Exam`,
        examType: newExam.type
      };

      // Chỉ gửi password nếu có giá trị (cho cả create và update)
      // Khi edit, nếu để trống = giữ nguyên password cũ
      if (newExam.examPassword && newExam.examPassword.trim() !== '') {
        examData.examPassword = newExam.examPassword;
      } else if (!editingExam) {
        // Khi tạo mới, nếu không nhập password thì set null
        examData.examPassword = null;
      }

      let result;
      if (editingExam) {
        result = await examService.updateExam(editingExam.id, examData);
        setExams(exams.map(exam => exam.id === editingExam.id ? result : exam));
      } else {
        result = await examService.createExam(examData);
        setExams([...exams, result]);
      }

      setNewExam({ subjectId: '', semesterId: '', examName: '', type: 'PE', examPassword: '' });
      setEditingExam(null);
    } catch (error) {
      setExamsError(editingExam ? 'Không thể cập nhật kỳ thi.' : 'Không thể tạo kỳ thi.');
      console.error('Error saving exam:', error);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setNewExam({
      subjectId: exam.subjectId,
      semesterId: exam.semesterId,
      examName: exam.examName,
      type: exam.examType,
      examPassword: '' // Password không được trả về từ backend vì lý do bảo mật
    });
    setShowExamModal(true);
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kỳ thi này?')) {
      return;
    }
    setIsLoadingExams(true);
    setExamsError(null);
    try {
      await examService.deleteExam(examId);
      setExams(exams.filter(exam => exam.id !== examId));
    } catch (error) {
      setExamsError('Không thể xóa kỳ thi.');
      console.error('Error deleting exam:', error);
    } finally {
      setIsLoadingExams(false);
    }
  };

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
    // hoặc: SWD392_PE_SU25_SE184696_Nguyen Phuc Nhan
    if (parts.length >= 4) {
      // Tìm MSSV (bắt đầu bằng SE/HE/... và theo sau là số)
      let studentIdIndex = -1;
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i].match(/^(SE|HE|SS|HS|GD|AI)\d+$/i)) {
          studentIdIndex = i;
          break;
        }
      }
      
      if (studentIdIndex !== -1) {
        // Xác định semester và examType
        let semester = '';
        let examType = '';
        
        // Kiểm tra parts[1] và parts[2]
        if (parts[1].match(/^(PE|FE|TE)$/i)) {
          examType = parts[1].toUpperCase();
          semester = parts[2];
        } else if (parts[2].match(/^(PE|FE|TE)$/i)) {
          semester = parts[1];
          examType = parts[2].toUpperCase();
        }
        
        // Lấy tên sinh viên (từ SAU MSSV đến hết)
        // VD: SWD392_PE_SU25_SE184696_NguyenPhucNhan
        // studentIdIndex = 3, tên = parts[4] trở đi
        const studentName = parts.slice(studentIdIndex + 1).join(' ');
        
        return {
          subject: parts[0],
          semester: semester,
          examType: examType,
          slot: 1, // Default slot = 1 nếu không có trong tên file
          password: '000000', // Default password nếu không có
          studentName: studentName || 'Unknown',
          studentId: parts[studentIdIndex],
        };
      }
    }
    
    return null;
  };

  // Handle JSON student import
  const handleUploadStudentFiles = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension
    if (!file.name.endsWith('.json')) {
      alert('Vui lòng chọn file JSON!');
      return;
    }

    setIsUploadingStudents(true);
    setStudentsError(null);

    try {
      console.log('Uploading students JSON file:', file.name);

      const response = await fileService.importStudents(file);

      console.log('Import students API response:', response);

      // Map API response to UI format
      const importedStudents = response.students.map((s, index) => ({
        id: s.studentId || index + 1,
        studentId: s.studentId,
        studentName: s.fullName,
        createdAt: s.createdAt || new Date().toISOString()
      }));

      // Update exam with imported students (or update global students list)
      if (selectedExam) {
        setExams(exams.map(exam => 
          exam.id === selectedExam.id 
            ? { ...exam, students: importedStudents }
            : exam
        ));
      }

      // Success alert
      const studentList = importedStudents.slice(0, 5).map(s => `  • ${s.studentName} (${s.studentId})`).join('\n');
      const moreText = importedStudents.length > 5 ? `\n  ... và ${importedStudents.length - 5} sinh viên khác` : '';
      alert(`✓ Đã import thành công ${response.importedCount} sinh viên!\n\nMột số sinh viên:\n${studentList}${moreText}`);
      
      setShowUploadModal(false);
      setSelectedExam(null);
    } catch (error) {
      console.error('Error importing students:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể import sinh viên';
      setStudentsError(errorMessage);
      alert(`❌ Lỗi: ${errorMessage}`);
    } finally {
      setIsUploadingStudents(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleImportCriteria = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      alert('Vui lòng chọn file Excel (.xlsx)!');
      return;
    }

    if (!selectedExam) {
      alert('Vui lòng chọn kỳ thi trước!');
      return;
    }

    setIsUploadingCriteria(true);
    setCriteriaError(null);

    try {
      console.log('Uploading criteria for exam:', selectedExam);

      const response = await fileService.importCriteria(file, selectedExam.id);

      console.log('Import criteria API response:', response);

      // Map API response to UI format
      const importedCriteria = response.criterias.map((c, index) => ({
        id: c.criteriaId || index + 1,
        order: c.sortOrder || index + 1,
        name: c.criteriaName,
        maxScore: c.maxScore,
        description: c.description || ''
      }));

      // Update exam with imported criteria
      const updatedExams = exams.map(exam => 
        exam.id === selectedExam.id 
          ? { ...exam, gradingCriteria: importedCriteria }
          : exam
      );
      
      setExams(updatedExams);

      // Success alert
      const criteriaList = importedCriteria.map(c => `  • ${c.name}: ${c.maxScore} điểm`).join('\n');
      alert(`✓ Đã import thành công ${response.importedCount} tiêu chí!\n\nCác tiêu chí:\n${criteriaList}`);
      
      setShowCriteriaModal(false);
      setSelectedExam(null);
    } catch (error) {
      console.error('Error importing criteria:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể import tiêu chí';
      setCriteriaError(errorMessage);
      alert(`❌ Lỗi: ${errorMessage}`);
    } finally {
      setIsUploadingCriteria(false);
      e.target.value = ''; // Reset file input
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : 'N/A';
  };

  const getSemesterName = (semesterId) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? semester.code : 'N/A';
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Chưa phân công';
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <BookOpen size={28} />
            <span>Admin Dashboard</span>
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
          <h1>Quản lý Hệ thống Chấm Bài</h1>
          <p>Quản lý môn học, kỳ thi và phân công giáo viên</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon subject-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <h3>{subjects.length}</h3>
              <p>Môn học</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon semester-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>{semesters.length}</h3>
              <p>Học kỳ</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon exam-icon">
              <FileSpreadsheet size={24} />
            </div>
            <div className="stat-info">
              <h3>{exams.length}</h3>
              <p>Kỳ thi</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon teacher-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{teachers.length}</h3>
              <p>Giáo viên</p>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="section">
          <div className="section-header">
            <h2>Danh sách Môn học</h2>
            <button 
              onClick={() => {
                setEditingSubject(null);
                setNewSubject({ code: '', name: '' });
                setShowSubjectModal(true);
              }}
              className="btn btn-primary"
              disabled={isLoadingSubjects}
            >
              <Plus size={18} />
              Thêm môn học
            </button>
          </div>
          {subjectsError && (
            <div className="error-message">
              <AlertCircle size={18} />
              {subjectsError}
            </div>
          )}
          <div className="table-container">
            {isLoadingSubjects && subjects.length === 0 ? (
              <div className="loading-container">
                <Loader2 size={32} className="spinner" />
                <p>Đang tải danh sách môn học...</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã môn học</th>
                    <th>Tên môn học</th>
                    <th>Số lượng kỳ thi</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => (
                    <tr key={subject.id}>
                      <td><strong>{subject.code}</strong></td>
                      <td>{subject.name}</td>
                      <td>{exams.filter(e => e.subjectId === subject.id).length}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="btn btn-secondary btn-sm"
                            disabled={isLoadingSubjects}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="btn btn-danger btn-sm"
                            disabled={isLoadingSubjects}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Semesters Section */}
        <div className="section">
          <div className="section-header">
            <h2>Danh sách Học kỳ</h2>
            <button 
              onClick={() => {
                setEditingSemester(null);
                setNewSemester({ code: '', name: '' });
                setShowSemesterModal(true);
              }}
              className="btn btn-primary"
              disabled={isLoadingSemesters}
            >
              <Plus size={18} />
              Thêm học kỳ
            </button>
          </div>
          {semestersError && (
            <div className="error-message">
              <AlertCircle size={18} />
              {semestersError}
            </div>
          )}
          <div className="table-container">
            {isLoadingSemesters && semesters.length === 0 ? (
              <div className="loading-container">
                <Loader2 size={32} className="spinner" />
                <p>Đang tải danh sách học kỳ...</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã học kỳ</th>
                    <th>Tên học kỳ</th>
                    {/* <th>Số lượng kỳ thi</th> */}
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {semesters.map(semester => (
                    <tr key={semester.id}>
                      <td><strong>{semester.code}</strong></td>
                      <td>{semester.name || '-'}</td>
                      {/* <td>{exams.filter(e => e.semester === semester.code).length}</td> */}
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditSemester(semester)}
                            className="btn btn-secondary btn-sm"
                            disabled={isLoadingSemesters}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteSemester(semester.id)}
                            className="btn btn-danger btn-sm"
                            disabled={isLoadingSemesters}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Exams Section */}
        <div className="section">
          <div className="section-header">
            <h2>Danh sách Kỳ thi</h2>
            <button 
              onClick={() => {
                setEditingExam(null);
                setNewExam({ subjectId: '', semesterId: '', examName: '', type: 'PE', examPassword: '' });
                setShowExamModal(true);
              }}
              className="btn btn-primary"
              disabled={isLoadingExams}
            >
              <Plus size={18} />
              Tạo kỳ thi
            </button>
          </div>
          {examsError && (
            <div className="error-message">
              <AlertCircle size={18} />
              {examsError}
            </div>
          )}
          <div className="table-container">
            {isLoadingExams && exams.length === 0 ? (
              <div className="loading-container">
                <Loader2 size={32} className="spinner" />
                <p>Đang tải danh sách kỳ thi...</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Môn học</th>
                    <th>Học kỳ</th>
                    <th>Tên kỳ thi</th>
                    <th>Loại thi</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map(exam => (
                    <tr key={exam.id}>
                      <td>{getSubjectName(exam.subjectId)}</td>
                      <td><strong>{getSemesterName(exam.semesterId)}</strong></td>
                      <td>{exam.examName}</td>
                      <td><span className="badge">{exam.examType}</span></td>
                      <td>{exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditExam(exam)}
                            className="btn btn-secondary btn-sm"
                            disabled={isLoadingExams}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="btn btn-danger btn-sm"
                            disabled={isLoadingExams}
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowCriteriaModal(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            disabled={isLoadingExams}
                          >
                            <Upload size={16} />
                            Tiêu chí
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExam({
                                ...exam,
                                subject: subjects.find(s => s.id === exam.subjectId)
                              });
                              setShowUploadModal(true);
                            }}
                            className="btn btn-primary btn-sm"
                            disabled={isLoadingExams}
                          >
                            <Archive size={16} />
                            Upload bài
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSubject ? 'Chỉnh sửa Môn học' : 'Thêm Môn học mới'}</h2>
              <button className="close-btn" onClick={() => {
                setShowSubjectModal(false);
                setEditingSubject(null);
                setNewSubject({ code: '', name: '' });
              }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubject} className="modal-form">
                <div className="form-group">
                  <label>
                    <BookOpen size={16} />
                    Mã môn học
                  </label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    placeholder="VD: SWD392"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Tên môn học
                  </label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    placeholder="VD: Software Architecture and Design"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowSubjectModal(false);
                    setEditingSubject(null);
                    setNewSubject({ code: '', name: '' });
                  }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoadingSubjects}>
                    <Plus size={18} />
                    {editingSubject ? 'Cập nhật' : 'Thêm môn học'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Semester Modal */}
      {showSemesterModal && (
        <div className="modal-overlay" onClick={() => setShowSemesterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSemester ? 'Chỉnh sửa Học kỳ' : 'Thêm Học kỳ mới'}</h2>
              <button className="close-btn" onClick={() => {
                setShowSemesterModal(false);
                setEditingSemester(null);
                setNewSemester({ code: '', name: '' });
              }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSemester} className="modal-form">
                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Mã học kỳ
                  </label>
                  <input
                    type="text"
                    value={newSemester.code}
                    onChange={(e) => setNewSemester({ ...newSemester, code: e.target.value })}
                    placeholder="VD: SU25, FA24"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Tên học kỳ (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newSemester.name}
                    onChange={(e) => setNewSemester({ ...newSemester, name: e.target.value })}
                    placeholder="VD: Summer 2025"
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowSemesterModal(false);
                    setEditingSemester(null);
                    setNewSemester({ code: '', name: '' });
                  }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoadingSemesters}>
                    <Plus size={18} />
                    {editingSemester ? 'Cập nhật' : 'Thêm học kỳ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="modal-overlay" onClick={() => setShowExamModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExam ? 'Chỉnh sửa Kỳ thi' : 'Tạo Kỳ thi mới'}</h2>
              <button className="close-btn" onClick={() => {
                setShowExamModal(false);
                setEditingExam(null);
                setNewExam({ subjectId: '', semesterId: '', examName: '', type: 'PE', examPassword: '' });
              }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddExam} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <BookOpen size={16} />
                      Môn học
                    </label>
                    <select
                      value={newExam.subjectId}
                      onChange={(e) => setNewExam({ ...newExam, subjectId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn môn học --</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <Calendar size={16} />
                      Học kỳ
                    </label>
                    <select
                      value={newExam.semesterId}
                      onChange={(e) => setNewExam({ ...newExam, semesterId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn học kỳ --</option>
                      {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>
                          {semester.code}{semester.name ? ` - ${semester.name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Tên kỳ thi
                  </label>
                  <input
                    type="text"
                    value={newExam.examName}
                    onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                    placeholder="VD: PE - Practical Exam Spring 2025"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FileText size={16} />
                      Loại thi
                    </label>
                    <select
                      value={newExam.type}
                      onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}
                      required
                    >
                      <option value="Practical Exam">PE - Practical Exam</option>
                      <option value="Final Exam">FE - Final Exam</option>
                      <option value="Theory Exam">TE - Theory Exam</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <Archive size={16} />
                      Mật khẩu (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={newExam.examPassword || ''}
                      onChange={(e) => setNewExam({ ...newExam, examPassword: e.target.value })}
                      placeholder={editingExam ? "Để trống nếu không muốn đổi mật khẩu" : "Mật khẩu bảo vệ kỳ thi"}
                    />
                    {editingExam && (
                      <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        💡 Để trống nếu muốn giữ nguyên mật khẩu hiện tại
                      </small>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowExamModal(false);
                    setEditingExam(null);
                    setNewExam({ subjectId: '', semesterId: '', examName: '', type: 'PE', examPassword: '' });
                  }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoadingExams}>
                    <Plus size={18} />
                    {editingExam ? 'Cập nhật' : 'Tạo kỳ thi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Import Modal */}
      {showCriteriaModal && selectedExam && (
        <div className="modal-overlay" onClick={() => setShowCriteriaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Tiêu chí chấm điểm</h2>
              <button className="close-btn" onClick={() => setShowCriteriaModal(false)}>
                ×
              </button>
            </div>
            <div className="import-section">
              <p>Kỳ thi: <strong>{getSubjectName(selectedExam.subjectId)} - {selectedExam.semester}</strong></p>
              
              {isUploadingCriteria ? (
                <div className="upload-progress">
                  <div className="loading-spinner"></div>
                  <p>Đang upload và xử lý file...</p>
                </div>
              ) : (
                <>
                  <div className="upload-area">
                    <FileSpreadsheet size={48} />
                    <h3>Chọn file Excel</h3>
                    <p>File Excel cần có 3 cột: <strong>Order</strong> (Số thứ tự), <strong>Criteria</strong> (Tiêu chí), <strong>Score</strong> (Điểm)</p>
                    <p className="format-note">Ví dụ: 1 | Thiết kế kiến trúc | 2</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleImportCriteria}
                      className="file-input"
                      disabled={isUploadingCriteria}
                    />
                  </div>
                  
                  {criteriaError && (
                    <div className="error-message">
                      <AlertCircle size={20} />
                      <span>{criteriaError}</span>
                    </div>
                  )}
                </>
              )}
              
              {selectedExam.gradingCriteria && selectedExam.gradingCriteria.length > 0 && (
                <div className="criteria-preview">
                  <h4>Tiêu chí hiện tại ({selectedExam.gradingCriteria.length}):</h4>
                  <ul>
                    {selectedExam.gradingCriteria.map(c => (
                      <li key={c.id}>
                        {c.name} - <strong>{c.maxScore} điểm</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Student Files Modal */}
      {showUploadModal && selectedExam && (
        <div className="modal-overlay" onClick={() => !isUploadingStudents && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Danh sách Sinh viên</h2>
              {!isUploadingStudents && (
                <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                  ×
                </button>
              )}
            </div>
            <div className="import-section">
              <p>Kỳ thi: <strong>{getSubjectName(selectedExam.subjectId)} - {getSemesterName(selectedExam.semesterId)}</strong></p>
              
              {isUploadingStudents ? (
                <div className="upload-progress">
                  <div className="loading-spinner"></div>
                  <p>Đang upload và xử lý file...</p>
                </div>
              ) : (
                <>
                  <div className="upload-area">
                    <Users size={48} />
                    <h3>Chọn file JSON</h3>
                    <p>File JSON chứa danh sách sinh viên</p>
                    <div className="file-format">
                      <p><strong>Format JSON:</strong></p>
                      <pre style={{ textAlign: 'left', fontSize: '12px', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>[
  {{
    "studentId": "SE161572",
    "fullName": "Nguyen Van A"
  }},
  {{
    "studentId": "SE161573",
    "fullName": "Tran Thi B"
  }}
]</pre>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleUploadStudentFiles}
                      className="file-input"
                      disabled={isUploadingStudents}
                    />
                  </div>
                  
                  {studentsError && (
                    <div className="error-message">
                      <AlertCircle size={20} />
                      <span>{studentsError}</span>
                    </div>
                  )}
                </>
              )}
              
              {selectedExam.students && selectedExam.students.length > 0 && (
                <div className="criteria-preview">
                  <h4>Sinh viên đã import ({selectedExam.students.length}):</h4>
                  <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedExam.students.map(student => (
                      <li key={student.id}>
                        <Users size={16} />
                        <strong>{student.studentName}</strong> ({student.studentId})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
