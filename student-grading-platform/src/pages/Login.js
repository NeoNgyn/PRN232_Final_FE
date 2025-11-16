import React, { useState, useEffect, useCallback } from 'react';
import { LogIn } from 'lucide-react';
import './Login.css';
import { API_ENDPOINTS, GOOGLE_CLIENT_ID } from '../config/api';

// Mock users
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { id: 2, username: 'teacher1', password: 'teacher123', role: 'teacher', name: 'Nguyễn Văn A' },
  { id: 3, username: 'teacher2', password: 'teacher123', role: 'teacher', name: 'Trần Thị B' },
  { id: 4, username: 'manager', password: 'manager123', role: 'manager', name: 'Quản lý' },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleCallback = useCallback(async (response) => {
    setIsGoogleLoading(true);
    setError('');

    try {
      const idToken = response.credential;

      // Call backend API
      const apiResponse = await fetch(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await apiResponse.json();

      if (apiResponse.ok && data.statusCode === 200) {
        // Store tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Create user object from response
        const user = {
          id: data.data.userId,
          email: data.data.email,
          name: data.data.fullName,
          role: data.data.role.toLowerCase(),
          profilePicture: data.data.profilePicture,
        };

        // Call parent onLogin handler
        onLogin(user);
      } else {
        setError(data.message || 'Đăng nhập Google thất bại');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Lỗi kết nối đến server. Vui lòng thử lại!');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [onLogin]);

  // Load Google OAuth script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [handleGoogleCallback]);

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google OAuth chưa được tải. Vui lòng thử lại!');
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

        <div className="divider">
          <span>hoặc</span>
        </div>

        <button 
          type="button" 
          className="btn btn-google"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>Đang đăng nhập...</>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập bằng Google
            </>
          )}
        </button>

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
