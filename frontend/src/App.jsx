import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages - Student
import StudentDashboard from './pages/student/Dashboard';
import CourseList from './pages/student/CourseList';
import CourseDetails from './pages/student/CourseDetails';
import Assignments from './pages/student/Assignments';
import AssignmentSubmission from './pages/student/AssignmentSubmission';

// Pages - Admin
import AdminDashboard from './pages/admin/Dashboard';
import ManageCourses from './pages/admin/ManageCourses';
import CreateCourse from './pages/admin/CreateCourse';
import EditCourse from './pages/admin/EditCourse';
import ManageAssignments from './pages/admin/ManageAssignments';
import GradeAssignments from './pages/admin/GradeAssignments';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create a client for React Query
const queryClient = new QueryClient();

// Set up axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
console.log(axios.defaults.baseURL);

axios.defaults.withCredentials = false;
axios.defaults.headers.common['Accept'] = 'application/json';

// Add request interceptor to handle auth
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set CORS headers here - let the browser handle it
    return config;
  },
  error => Promise.reject(error)
);

// Error interceptor remains the same
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/courses" element={<CourseList />} />
              <Route path="/student/courses/:courseId" element={<CourseDetails />} />
              <Route path="/student/assignments" element={<Assignments />} />
              <Route path="/student/assignments/:assignmentId" element={<AssignmentSubmission />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<ManageCourses />} />
              <Route path="/admin/courses/create" element={<CreateCourse />} />
              <Route path="/admin/courses/:courseId/edit" element={<EditCourse />} />
              <Route path="/admin/assignments" element={<ManageAssignments />} />
              <Route path="/admin/assignments/:assignmentId/grade" element={<GradeAssignments />} />
            </Route>
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRole }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  
  return children;
}

export default App;
