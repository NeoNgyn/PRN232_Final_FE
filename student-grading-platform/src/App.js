import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import GradingPage from './pages/GradingPage';
import './App.css';

// Initial mock subjects
const initialSubjects = [
  { id: 1, code: 'SWD392', name: 'Software Architecture and Design' },
  { id: 2, code: 'PRN231', name: 'Building Cross-Platform Applications' },
];

// Initial mock exams
const initialExams = [
  { 
    id: 1, 
    subjectId: 1, 
    semester: 'SU25', 
    type: 'PE', 
    slot: 1,
    teacherId: 2,
    gradingCriteria: [
      { id: 1, name: 'Thiết kế kiến trúc hệ thống', maxScore: 2, description: 'Đánh giá khả năng thiết kế kiến trúc' },
      { id: 2, name: 'Code quality và convention', maxScore: 2, description: 'Đánh giá chất lượng code' },
      { id: 3, name: 'Implement features', maxScore: 3, description: 'Triển khai các tính năng' },
      { id: 4, name: 'Database design', maxScore: 2, description: 'Thiết kế cơ sở dữ liệu' },
      { id: 5, name: 'Documentation', maxScore: 1, description: 'Tài liệu hướng dẫn' },
    ],
    students: []
  },
];

// Initial mock teachers
const initialTeachers = [
  { id: 2, name: 'Nguy\u1ec5n V\u0103n A', email: 'teacher1@fpt.edu.vn' },
  { id: 3, name: 'Tr\u1ea7n Th\u1ecb B', email: 'teacher2@fpt.edu.vn' },
];

// Initial mock semesters
const initialSemesters = [
  { id: 1, code: 'SU25', name: 'Summer 2025' },
  { id: 2, code: 'FA24', name: 'Fall 2024' },
];

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [exams, setExams] = useState(initialExams);
  const [teachers] = useState(initialTeachers);
  const [semesters, setSemesters] = useState(initialSemesters);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin" />
                ) : (
                  <Navigate to="/teacher" />
                )
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard 
                  user={user} 
                  onLogout={handleLogout}
                  subjects={subjects}
                  setSubjects={setSubjects}
                  exams={exams}
                  setExams={setExams}
                  teachers={teachers}
                  semesters={semesters}
                  setSemesters={setSemesters}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/teacher" 
            element={
              user && user.role === 'teacher' ? (
                <TeacherDashboard 
                  user={user} 
                  onLogout={handleLogout}
                  exams={exams}
                  subjects={subjects}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/grading/:examId" 
            element={
              user && user.role === 'teacher' ? (
                <GradingPage 
                  user={user} 
                  onLogout={handleLogout}
                  exams={exams}
                  setExams={setExams}
                  subjects={subjects}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
