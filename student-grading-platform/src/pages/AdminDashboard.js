import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Upload, BookOpen, Calendar, Users, FileSpreadsheet, Archive, FileText, AlertCircle, Loader2 } from 'lucide-react';
// import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import * as fileService from '../services/fileService';
import subjectService from '../services/subjectService';
import semesterService from '../services/semesterService';
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
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [semestersError, setSemestersError] = useState(null);
  const [editingSemester, setEditingSemester] = useState(null);

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

  const handleAddExam = (e) => {
    e.preventDefault();
    const exam = {
      id: exams.length + 1,
      ...newExam,
      subjectId: parseInt(newExam.subjectId),
      teacherId: parseInt(newExam.teacherId),
      slot: parseInt(newExam.slot),
      gradingCriteria: [],
      students: []
    };
    setExams([...exams, exam]);
    setNewExam({ subjectId: '', semester: '', type: 'PE', slot: '', teacherId: '' });
    setShowExamModal(false);
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

  // Handle RAR/ZIP upload
  const handleUploadStudentFiles = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'zip' && fileExt !== 'rar') {
      alert('Vui lòng chọn file ZIP hoặc RAR!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const students = [];

      let processed = 0;
      const totalFiles = Object.keys(contents.files).length;

      for (const [fileName, fileData] of Object.entries(contents.files)) {
        if (!fileData.dir && (fileName.endsWith('.docx') || fileName.endsWith('.doc'))) {
          const info = parseFileName(fileName.split('/').pop());
          if (info && 
              info.subject === selectedExam.subject.code && 
              info.semester === selectedExam.semester &&
              info.examType === selectedExam.type) {
            // Chỉ check slot nếu selectedExam có slot và info có slot
            const slotMatches = !selectedExam.slot || selectedExam.slot === info.slot;
            
            if (slotMatches) {
              const blob = await fileData.async('blob');
              students.push({
                id: students.length + 1,
                studentId: info.studentId,
                studentName: info.studentName,
                password: info.password,
                fileName: fileName.split('/').pop(),
                fileBlob: blob,
                fileUrl: URL.createObjectURL(blob),
                uploadedAt: new Date().toISOString()
              });
            }
          }
        }

        processed++;
        setUploadProgress(Math.round((processed / totalFiles) * 100));
      }

      if (students.length === 0) {
        alert('Không tìm thấy file nào phù hợp với kỳ thi này!');
        setIsUploading(false);
        return;
      }

      // Update exam with students
      setExams(exams.map(exam => 
        exam.id === selectedExam.id 
          ? { ...exam, students: students }
          : exam
      ));

      alert(`Đã upload thành công ${students.length} bài làm sinh viên!`);
      setShowUploadModal(false);
      setSelectedExam(null);
      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Lỗi khi xử lý file: ' + error.message);
      setIsUploading(false);
      setUploadProgress(0);
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
              onClick={() => setShowExamModal(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Tạo kỳ thi
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th>Học kỳ</th>
                  <th>Loại thi</th>
                  <th>Slot</th>
                  <th>Giáo viên</th>
                  <th>Tiêu chí</th>
                  <th>Bài nộp</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td>{getSubjectName(exam.subjectId)}</td>
                    <td><strong>{exam.semester}</strong></td>
                    <td><span className="badge">{exam.type}</span></td>
                    <td><span className="badge">Slot {exam.slot}</span></td>
                    <td>{getTeacherName(exam.teacherId)}</td>
                    <td>
                      {exam.gradingCriteria.length > 0 
                        ? `${exam.gradingCriteria.length} tiêu chí`
                        : 'Chưa có'
                      }
                    </td>
                    <td>
                      {exam.students && exam.students.length > 0 
                        ? <span className="badge badge-success">{exam.students.length} bài</span>
                        : <span className="badge badge-warning">Chưa có</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowCriteriaModal(true);
                          }}
                          className="btn btn-secondary btn-sm"
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
              <h2>Tạo Kỳ thi mới</h2>
              <button className="close-btn" onClick={() => setShowExamModal(false)}>
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
                      value={newExam.semester}
                      onChange={(e) => setNewExam({ ...newExam, semester: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn học kỳ --</option>
                      {semesters.map(semester => (
                        <option key={semester.id} value={semester.code}>
                          {semester.code}{semester.name ? ` - ${semester.name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      <option value="PE">PE - Practical Exam</option>
                      <option value="FE">FE - Final Exam</option>
                      <option value="TE">TE - Theory Exam</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <Archive size={16} />
                      Slot
                    </label>
                    <input
                      type="number"
                      value={newExam.slot}
                      onChange={(e) => setNewExam({ ...newExam, slot: e.target.value })}
                      placeholder="VD: 1, 2, 3"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <Users size={16} />
                    Giáo viên chấm bài
                  </label>
                  <select
                    value={newExam.teacherId}
                    onChange={(e) => setNewExam({ ...newExam, teacherId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowExamModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={18} />
                    Tạo kỳ thi
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
              
              {selectedExam.gradingCriteria.length > 0 && (
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
        <div className="modal-overlay" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Bài làm Sinh viên</h2>
              {!isUploading && (
                <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                  ×
                </button>
              )}
            </div>
            <div className="import-section">
              <p>Kỳ thi: <strong>{selectedExam.subject.code} - {selectedExam.semester} - {selectedExam.type}{selectedExam.slot ? ` - Slot ${selectedExam.slot}` : ''}</strong></p>
              <div className="upload-area">
                <Archive size={48} />
                <h3>Chọn file RAR/ZIP</h3>
                <p>File nén chứa các file docs của sinh viên</p>
                <div className="file-format">
                  <p><strong>Format 1 (đầy đủ):</strong></p>
                  <p>{selectedExam.subject.code}_{selectedExam.semester}_{selectedExam.type}_{selectedExam.slot || '1'}_358715_Vu Trung Tin_SE161572.docx</p>
                  <p style={{ marginTop: '12px' }}><strong>Format 2 (ngắn gọn):</strong></p>
                  <p>{selectedExam.subject.code}_{selectedExam.type}_{selectedExam.semester}_SE161572_NguyenVanA.docx</p>
                </div>
                {!isUploading && (
                  <input
                    type="file"
                    accept=".zip,.rar"
                    onChange={handleUploadStudentFiles}
                    className="file-input"
                  />
                )}
                {isUploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p>Đang xử lý... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              {selectedExam.students && selectedExam.students.length > 0 && (
                <div className="criteria-preview">
                  <h4>Bài làm đã upload ({selectedExam.students.length}):</h4>
                  <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedExam.students.map(student => (
                      <li key={student.id}>
                        <FileText size={16} />
                        <strong>{student.studentName}</strong> ({student.studentId}) - {student.fileName}
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
