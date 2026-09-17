import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { InterviewerDashboard } from './pages/InterviewerDashboard';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { InterviewCreatePage } from './pages/InterviewCreatePage';
import { InterviewRoom } from './pages/InterviewRoom';
import { InterviewReportPage } from './pages/InterviewReportPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Candidate Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume/upload"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <ResumeUploadPage />
                </ProtectedRoute>
              }
            />

            {/* Interviewer Protected Routes */}
            <Route
              path="/interviewer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['interviewer']}>
                  <InterviewerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviews/create"
              element={
                <ProtectedRoute allowedRoles={['interviewer']}>
                  <InterviewCreatePage />
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Interview Room & Report Routes */}
            <Route
              path="/interview/:roomId"
              element={
                <ProtectedRoute>
                  <InterviewRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:interviewId/report"
              element={
                <ProtectedRoute>
                  <InterviewReportPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
