import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import './Login.css';

// Mock users
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { id: 2, username: 'teacher1', password: 'teacher123', role: 'teacher', name: 'Nguyễn Văn A' },
  { id: 3, username: 'teacher2', password: 'teacher123', role: 'teacher', name: 'Trần Thị B' },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <LogIn size={40} />
          </div>
          <h1>Nền Tảng Chấm Bài</h1>
          <p>Hệ thống quản lý và chấm bài cho giáo viên</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            <LogIn size={20} />
            Đăng nhập
          </button>
        </form>

        <div className="demo-accounts">
          <h3>Tài khoản demo:</h3>
          <div className="demo-list">
            <div className="demo-item">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div className="demo-item">
              <strong>Giáo viên:</strong> teacher1 / teacher123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
