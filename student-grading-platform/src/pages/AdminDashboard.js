import React, { useState } from 'react';
import { LogOut, Plus, Upload, BookOpen, Calendar, Users, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

// Mock data
const initialSubjects = [
  { id: 1, code: 'SWD392', name: 'Software Architecture and Design' },
  { id: 2, code: 'PRN231', name: 'Building Cross-Platform Applications' },
];

const initialExams = [
  { 
    id: 1, 
    subjectId: 1, 
    semester: 'SU25', 
    type: 'PE', 
    teacherId: 2,
    gradingCriteria: []
  },
];

const initialTeachers = [
  { id: 2, name: 'Nguyễn Văn A', email: 'teacher1@fpt.edu.vn' },
  { id: 3, name: 'Trần Thị B', email: 'teacher2@fpt.edu.vn' },
];

function AdminDashboard({ user, onLogout }) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [exams, setExams] = useState(initialExams);
  const [teachers] = useState(initialTeachers);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [newSubject, setNewSubject] = useState({ code: '', name: '' });
  const [newExam, setNewExam] = useState({ 
    subjectId: '', 
    semester: '', 
    type: 'PE', 
    teacherId: '' 
  });

  const handleAddSubject = (e) => {
    e.preventDefault();
    const subject = {
      id: subjects.length + 1,
      ...newSubject
    };
    setSubjects([...subjects, subject]);
    setNewSubject({ code: '', name: '' });
    setShowSubjectModal(false);
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    const exam = {
      id: exams.length + 1,
      ...newExam,
      subjectId: parseInt(newExam.subjectId),
      teacherId: parseInt(newExam.teacherId),
      gradingCriteria: []
    };
    setExams([...exams, exam]);
    setNewExam({ subjectId: '', semester: '', type: 'PE', teacherId: '' });
    setShowExamModal(false);
  };

  const handleImportCriteria = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const criteria = jsonData.map((row, index) => ({
        id: index + 1,
        name: row['Tiêu chí'] || row['Criteria'] || row['Name'] || `Tiêu chí ${index + 1}`,
        maxScore: parseFloat(row['Điểm tối đa'] || row['Max Score'] || row['Score'] || 10),
        description: row['Mô tả'] || row['Description'] || ''
      }));

      setExams(exams.map(exam => 
        exam.id === selectedExam.id 
          ? { ...exam, gradingCriteria: criteria }
          : exam
      ));

      alert(`Đã import ${criteria.length} tiêu chí chấm điểm!`);
      setShowCriteriaModal(false);
      setSelectedExam(null);
    };
    reader.readAsArrayBuffer(file);
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
            <div className="stat-icon exam-icon">
              <Calendar size={24} />
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
              onClick={() => setShowSubjectModal(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Thêm môn học
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã môn học</th>
                  <th>Tên môn học</th>
                  <th>Số lượng kỳ thi</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.id}>
                    <td><strong>{subject.code}</strong></td>
                    <td>{subject.name}</td>
                    <td>{exams.filter(e => e.subjectId === subject.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <th>Giáo viên</th>
                  <th>Tiêu chí</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td>{getSubjectName(exam.subjectId)}</td>
                    <td><strong>{exam.semester}</strong></td>
                    <td><span className="badge">{exam.type}</span></td>
                    <td>{getTeacherName(exam.teacherId)}</td>
                    <td>
                      {exam.gradingCriteria.length > 0 
                        ? `${exam.gradingCriteria.length} tiêu chí`
                        : 'Chưa có'
                      }
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedExam(exam);
                          setShowCriteriaModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Upload size={16} />
                        Import tiêu chí
                      </button>
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
              <h2>Thêm Môn học mới</h2>
              <button className="close-btn" onClick={() => setShowSubjectModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <label>Mã môn học</label>
                <input
                  type="text"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  placeholder="VD: SWD392"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên môn học</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="VD: Software Architecture and Design"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={18} />
                Thêm môn học
              </button>
            </form>
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
            <form onSubmit={handleAddExam}>
              <div className="form-group">
                <label>Môn học</label>
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
                <label>Học kỳ</label>
                <input
                  type="text"
                  value={newExam.semester}
                  onChange={(e) => setNewExam({ ...newExam, semester: e.target.value })}
                  placeholder="VD: SU25, FA24"
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại thi</label>
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
                <label>Giáo viên chấm bài</label>
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
              <button type="submit" className="btn btn-primary">
                <Plus size={18} />
                Tạo kỳ thi
              </button>
            </form>
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
              <div className="upload-area">
                <FileSpreadsheet size={48} />
                <h3>Chọn file Excel</h3>
                <p>File Excel cần có các cột: Tiêu chí, Điểm tối đa, Mô tả</p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportCriteria}
                  className="file-input"
                />
              </div>
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
    </div>
  );
}

export default AdminDashboard;
