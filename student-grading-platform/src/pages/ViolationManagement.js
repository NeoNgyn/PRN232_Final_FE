import React, { useState, useEffect } from 'react';
import { AlertTriangle, Edit2, Trash2, Loader2, X, Check, AlertCircle } from 'lucide-react';
import violationService from '../services/violationService';
import './ViolationManagement.css';

function ViolationManagement() {
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingViolation, setEditingViolation] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    severity: '',
    penalty: 0,
    resolved: false
  });

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await violationService.getAllViolations();
      setViolations(data);
    } catch (err) {
      setError('Không thể tải danh sách violations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (violation) => {
    setEditingViolation(violation);
    setFormData({
      type: violation.type,
      description: violation.description || '',
      severity: violation.severity || '',
      penalty: violation.penalty || 0,
      resolved: violation.resolved
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa violation này?')) return;

    try {
      await violationService.deleteViolation(id);
      setViolations(violations.filter(v => v.id !== id));
    } catch (err) {
      alert('Lỗi khi xóa violation');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await violationService.updateViolation(editingViolation.id, formData);
      await loadViolations();
      setShowEditModal(false);
      setEditingViolation(null);
    } catch (err) {
      alert('Lỗi khi cập nhật violation');
      console.error(err);
    }
  };

  const getSeverityBadge = (severity) => {
    const severityColors = {
      'Low': 'severity-low',
      'Medium': 'severity-medium',
      'High': 'severity-high',
      'Critical': 'severity-critical'
    };
    return severityColors[severity] || 'severity-default';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={48} />
        <p>Đang tải violations...</p>
      </div>
    );
  }

  return (
    <div className="violation-management">
      <div className="page-header">
        <div className="header-content">
          <AlertTriangle size={32} className="header-icon" />
          <div>
            <h1>Quản lý Vi phạm</h1>
            <p>Quản lý và theo dõi các vi phạm trong bài nộp</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="violations-table-container">
        <table className="violations-table">
          <thead>
            <tr>
              <th>Loại vi phạm</th>
              <th>Mô tả</th>
              <th>Mức độ</th>
              <th>Phạt (điểm)</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {violations.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <AlertTriangle size={48} />
                  <p>Chưa có violation nào</p>
                </td>
              </tr>
            ) : (
              violations.map((violation) => (
                <tr key={violation.id}>
                  <td className="violation-type">{violation.type}</td>
                  <td className="violation-desc">{violation.description || '-'}</td>
                  <td>
                    <span className={`severity-badge ${getSeverityBadge(violation.severity)}`}>
                      {violation.severity || 'N/A'}
                    </span>
                  </td>
                  <td className="penalty-value">-{violation.penalty || 0}</td>
                  <td>{new Date(violation.detectedAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <span className={`status-badge ${violation.resolved ? 'resolved' : 'pending'}`}>
                      {violation.resolved ? (
                        <>
                          <Check size={14} /> Đã xử lý
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} /> Chưa xử lý
                        </>
                      )}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(violation)}
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(violation.id)}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa Violation</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Loại vi phạm *</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    maxLength={50}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mức độ</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="form-control"
                    >
                      <option value="">-- Chọn mức độ --</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Phạt (điểm) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.penalty}
                      onChange={(e) => setFormData({ ...formData, penalty: parseFloat(e.target.value) })}
                      required
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.resolved}
                      onChange={(e) => setFormData({ ...formData, resolved: e.target.checked })}
                    />
                    <span>Đã xử lý</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViolationManagement;
