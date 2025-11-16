import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, ClipboardList, FileText, Loader2, AlertCircle } from 'lucide-react';
import examService from '../services/examService';
import subjectService from '../services/subjectService';
import semesterService from '../services/semesterService';
import submissionService from '../services/submissionService';
import './TeacherDashboard.css';

function TeacherDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  
  // State management
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(true);
  const [examsError, setExamsError] = useState(null);
  const [subjectsError, setSubjectsError] = useState(null);
  const [semestersError, setSemestersError] = useState(null);

  // Fetch exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoadingExams(true);
      setExamsError(null);
      try {
        const fetchedExams = await examService.getAllExams();
        setExams(fetchedExams);
      } catch (error) {
        setExamsError('Không thể tải danh sách kỳ thi.');
        console.error('Error fetching exams:', error);
      } finally {
        setIsLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  // Fetch subjects from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setSubjectsError(null);
      try {
        const fetchedSubjects = await subjectService.getAllSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        setSubjectsError('Không thể tải danh sách môn học.');
        console.error('Error fetching subjects:', error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch semesters from backend
  useEffect(() => {
    const fetchSemesters = async () => {
      setIsLoadingSemesters(true);
      setSemestersError(null);
      try {
        const fetchedSemesters = await semesterService.getAllSemesters();
        setSemesters(fetchedSemesters);
      } catch (error) {
        setSemestersError('Không thể tải danh sách học kỳ.');
        console.error('Error fetching semesters:', error);
      } finally {
        setIsLoadingSemesters(false);
      }
    };
    fetchSemesters();
  }, []);

  // Fetch submissions for each exam by examinerId
  useEffect(() => {
    const fetchSubmissionsForExams = async () => {
      if (exams.length === 0 || !user.id) return;

      try {
        const submissionsMap = {};
        for (const exam of exams) {
          try {
            const examSubmissions = await submissionService.getSubmissionsByExamAndExaminer(exam.id, user.id);
            submissionsMap[exam.id] = examSubmissions;
          } catch (error) {
            console.error(`Error fetching submissions for exam ${exam.id}:`, error);
            submissionsMap[exam.id] = [];
          }
        }
        setSubmissions(submissionsMap);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    fetchSubmissionsForExams();
  }, [exams, user.id]);

  // All exams are assigned to the logged-in teacher (examinerId)
  const assignedExams = exams;

  const handleStartGrading = (examId) => {
    navigate(`/grading/${examId}`);
  };

  const calculateProgress = (exam) => {
    const examSubmissions = submissions[exam.id] || [];
    const totalSubmissions = examSubmissions.length;
    const gradedSubmissions = examSubmissions.filter(s => s.gradingStatus === 'Passed' || s.gradingStatus === 'Failed').length;
    if (totalSubmissions === 0) return 0;
    return Math.round((gradedSubmissions / totalSubmissions) * 100);
  };

  const getSubjectById = (subjectId) => {
    return subjects.find(s => s.id === subjectId);
  };

  const getSemesterById = (semesterId) => {
    return semesters.find(s => s.id === semesterId);
  };

  // Show loading state
  if (isLoadingExams || isLoadingSubjects || isLoadingSemesters) {
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
        <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} className="spin" />
            <p style={{ marginTop: '16px' }}>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (examsError || subjectsError || semestersError) {
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
        <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: '#dc3545' }}>
            <AlertCircle size={48} />
            <p style={{ marginTop: '16px' }}>{examsError || subjectsError || semestersError}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '16px' }}>
              Tải lại
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <h3>{Object.values(submissions).reduce((sum, subs) => sum + subs.length, 0)}</h3>
              <p>Tổng bài nộp</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon graded-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <h3>{Object.values(submissions).reduce((sum, subs) => sum + subs.filter(s => s.gradingStatus === 'Passed' || s.gradingStatus === 'Failed').length, 0)}</h3>
              <p>Đã chấm xong</p>
            </div>
          </div>
        </div>

        {/* Assigned Exams */}
        <div className="exams-grid">
          {assignedExams.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
              <ClipboardList size={48} style={{ margin: '0 auto 16px' }} />
              <p>Chưa có kỳ thi nào được phân công</p>
            </div>
          ) : (
            assignedExams.map((exam) => {
              const progress = calculateProgress(exam);
              const subject = getSubjectById(exam.subjectId);
              const semester = getSemesterById(exam.semesterId);
              const examSubmissions = submissions[exam.id] || [];
              const submittedStudents = examSubmissions.length;
              const gradedStudents = examSubmissions.filter(s => s.gradingStatus === 'Passed' || s.gradingStatus === 'Failed').length;
            
              return (
                <div key={exam.id} className="exam-card">
                  <div className="exam-header">
                    <div className="exam-badge">{exam.examType}</div>
                    <div className="exam-semester">{semester?.code || 'N/A'}</div>
                  </div>
                  
                  <div className="exam-body">
                    <h3>{subject?.code || 'N/A'}</h3>
                    <p className="exam-name">{subject?.name || exam.examName}</p>
                    <p className="exam-slot" style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    
                    <div className="exam-stats">
                      <div className="stat-item">
                        <span className="stat-label">Kỳ thi:</span>
                        <span className="stat-value">{exam.examName}</span>
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
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
