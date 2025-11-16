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

      console.log('Backend Response:', data); // Debug log

      // Check both statusCode (camelCase) and status_code (snake_case)
      const statusCode = data.statusCode || data.status_code;
      const isSuccess = data.is_success !== undefined ? data.is_success : (statusCode === 200);

      if (apiResponse.ok && isSuccess && data.data) {
        // Store tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        // Map backend role to frontend role
        // Backend returns role from database (e.g., "Admin", "Examiner", "Lecturer", etc.)
        // Frontend expects: 'admin' for AdminDashboard, 'teacher' for TeacherDashboard
        const backendRole = data.data.role || '';
        let frontendRole = 'teacher'; // Default fallback
        
        // Map roles: Admin -> admin, Examiner/Lecturer -> teacher
        if (backendRole.toLowerCase() === 'admin') {
          frontendRole = 'admin';
        } else if (backendRole.toLowerCase() === 'examiner' || 
                   backendRole.toLowerCase() === 'lecturer' ||
                   backendRole.toLowerCase() === 'teacher') {
          frontendRole = 'teacher';
        }

        // Create user object from response - match backend GoogleLoginResponse fields
        const user = {
          id: data.data.userId,
          email: data.data.email,
          name: data.data.name,
          role: frontendRole, // Mapped role for frontend routing
          backendRole: backendRole, // Store original backend role
          isNewUser: data.data.isNewUser
        };

        console.log('Google Login Success:', { backendRole, frontendRole, user });

        // Call parent onLogin handler to navigate
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

  // Load Google OAuth script with proper button rendering to avoid FedCM errors
  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      
      if (existingScript) {
        initializeGoogleButton();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeGoogleButton();
      };

      script.onerror = () => {
        console.error('Failed to load Google Sign-In SDK');
      };

      document.body.appendChild(script);
    };

    const initializeGoogleButton = () => {
      if (window.google?.accounts?.id) {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button directly into a div
        const buttonDiv = document.getElementById('googleSignInButton');
        if (buttonDiv && buttonDiv.children.length === 0) {
          window.google.accounts.id.renderButton(
            buttonDiv,
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: buttonDiv.offsetWidth || 300,
            }
          );
        }
      }
    };

    loadGoogleScript();

    return () => {
      // Cleanup if needed
    };
  }, [handleGoogleCallback]);

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

        {/* Commented out username/password login - only using Google Sign-In */}
        {/* 
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
        */}

        {error && <div className="error-message">{error}</div>}

        {/* Google Sign-In Button Container */}
        <div 
          id="googleSignInButton" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '44px',
            width: '100%'
          }}
        >
          {/* Google button will be automatically rendered here */}
        </div>

        {isGoogleLoading && (
          <div style={{ textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Đang xử lý đăng nhập...
          </div>
        )}

        {/* Commented out demo accounts section */}
        {/* 
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
        */}
      </div>
    </div>
  );
}

export default Login;
