import React, { useState } from 'react';
import { LogOut, Plus, Upload, BookOpen, Calendar, Users, FileSpreadsheet, Archive, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import './AdminDashboard.css';

function AdminDashboard({ user, onLogout, subjects, setSubjects, exams, setExams, teachers }) {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [newSubject, setNewSubject] = useState({ code: '', name: '' });
  const [newExam, setNewExam] = useState({ 
    subjectId: '', 
    semester: '', 
    type: 'PE',
    slot: '',
    teacherId: '' 
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleImportCriteria = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Excel data:', jsonData);
        
        if (jsonData.length === 0) {
          alert('File Excel trống hoặc không đúng định dạng!');
          return;
        }

        // Log first row to see column names
        console.log('First row columns:', Object.keys(jsonData[0]));

        const criteria = jsonData.map((row, index) => {
          // Hỗ trợ nhiều tên cột khác nhau
          const name = row['Tiêu chí'] || row['Criteria'] || row['Name'] || 
                      row['Tieu chi'] || row['name'] || row['criteria'] || 
                      row['Tiêu Chí'] || row['TieuChi'] || `Tiêu chí ${index + 1}`;
          
          const maxScore = parseFloat(
            row['Điểm tối đa'] || row['Max Score'] || row['Score'] || 
            row['Diem toi da'] || row['MaxScore'] || row['score'] ||
            row['Điểm'] || row['Diem'] || row['max_score'] || 10
          );
          
          const description = row['Mô tả'] || row['Description'] || 
                            row['Mo ta'] || row['description'] || 
                            row['Mô Tả'] || row['MoTa'] || '';

          return {
            id: index + 1,
            name: name,
            maxScore: maxScore,
            description: description
          };
        });

        console.log('Parsed criteria:', criteria);

        setExams(exams.map(exam => 
          exam.id === selectedExam.id 
            ? { ...exam, gradingCriteria: criteria }
            : exam
        ));

        alert(`Đã import ${criteria.length} tiêu chí chấm điểm!`);
        setShowCriteriaModal(false);
        setSelectedExam(null);
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Lỗi khi đọc file Excel: ' + error.message);
      }
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
                <label>Slot</label>
                <input
                  type="number"
                  value={newExam.slot}
                  onChange={(e) => setNewExam({ ...newExam, slot: e.target.value })}
                  placeholder="VD: 1, 2, 3"
                  min="1"
                  required
                />
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
