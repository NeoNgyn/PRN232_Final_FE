import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Save, Calendar, BookOpen, 
  Loader2, AlertCircle 
} from 'lucide-react';
import semesterService from '../services/semesterService';
import subjectService from '../services/subjectService';
import './ManagementPanel.css';

function ManagementPanel() {
  const [activeTab, setActiveTab] = useState('semesters'); // semesters or subjects
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'semesters':
          const semestersData = await semesterService.getAllSemesters();
          setSemesters(semestersData);
          break;
        case 'subjects':
          const subjectsData = await subjectService.getAllSubjects();
          setSubjects(subjectsData);
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (activeTab === 'semesters') {
      setFormData(item || { code: '', name: '' });
    } else if (activeTab === 'subjects') {
      setFormData(item || { code: '', name: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'semesters':
          if (editingItem) {
            await semesterService.updateSemester(editingItem.id, formData);
          } else {
            await semesterService.createSemester(formData);
          }
          break;
        case 'subjects':
          if (editingItem) {
            await subjectService.updateSubject(editingItem.id, formData);
          } else {
            await subjectService.createSubject(formData);
          }
          break;
        default:
          break;
      }
      handleCloseModal();
      await loadData();
    } catch (err) {
      setError('Lỗi khi lưu dữ liệu. Vui lòng thử lại.');
      console.error('Error saving data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;

    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'semesters':
          await semesterService.deleteSemester(id);
          break;
        case 'subjects':
          await subjectService.deleteSubject(id);
          break;
        default:
          break;
      }
      await loadData();
    } catch (err) {
      setError('Lỗi khi xóa. Vui lòng thử lại.');
      console.error('Error deleting:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSemestersTable = () => (
    <table className="data-table">
      <thead>
        <tr>
          <th>Mã học kỳ</th>
          <th>Tên học kỳ</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {semesters.length === 0 ? (
          <tr><td colSpan="3" className="text-center">Chưa có dữ liệu</td></tr>
        ) : (
          semesters.map(sem => (
            <tr key={sem.id}>
              <td>{sem.code}</td>
              <td>{sem.name}</td>
              <td className="action-buttons">
                <button className="btn-icon btn-edit" onClick={() => handleOpenModal(sem)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(sem.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderSubjectsTable = () => (
    <table className="data-table">
      <thead>
        <tr>
          <th>Mã môn học</th>
          <th>Tên môn học</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {subjects.length === 0 ? (
          <tr><td colSpan="3" className="text-center">Chưa có dữ liệu</td></tr>
        ) : (
          subjects.map(subj => (
            <tr key={subj.id}>
              <td>{subj.code}</td>
              <td>{subj.name}</td>
              <td className="action-buttons">
                <button className="btn-icon btn-edit" onClick={() => handleOpenModal(subj)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(subj.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {
                activeTab === 'semesters' ? 'Học kỳ' : 'Môn học'
              }
            </h3>
            <button className="btn-close" onClick={handleCloseModal}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {activeTab === 'semesters' && (
                <>
                  <div className="form-group">
                    <label>Mã học kỳ *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code || ''}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="VD: SP25, SU24"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên học kỳ</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="VD: Spring 2025"
                    />
                  </div>
                </>
              )}

              {activeTab === 'subjects' && (
                <>
                  <div className="form-group">
                    <label>Mã môn học *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code || ''}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="VD: PRN232, SWD392"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên môn học *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="VD: Advanced C# Programming"
                    />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="management-panel">
      <div className="panel-header">
        <h2>Quản lý dữ liệu</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Thêm mới
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'semesters' ? 'active' : ''}`}
          onClick={() => setActiveTab('semesters')}
        >
          <Calendar size={18} />
          Học kỳ
        </button>
        <button 
          className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          <BookOpen size={18} />
          Môn học
        </button>
      </div>

      <div className="tab-content">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={48} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {activeTab === 'semesters' && renderSemestersTable()}
            {activeTab === 'subjects' && renderSubjectsTable()}
          </>
        )}
      </div>

      {renderModal()}
    </div>
  );
}

export default ManagementPanel;
