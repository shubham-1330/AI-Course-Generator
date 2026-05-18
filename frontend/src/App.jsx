import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import CourseHub from './pages/CourseHub';
import LessonView from './pages/LessonView';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/course/new" element={
        <ProtectedRoute>
          <CreateCourse />
        </ProtectedRoute>
      } />
      <Route path="/course/:courseId" element={
        <ProtectedRoute>
          <CourseHub />
        </ProtectedRoute>
      } />
      <Route path="/course/:courseId/lessons/:moduleIdx/:lessonIdx" element={
        <ProtectedRoute>
          <LessonView />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
