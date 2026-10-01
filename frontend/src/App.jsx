import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterProfile from "./pages/RecruiterProfile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import JobApplicants from "./pages/JobApplicants";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import { getStoredUser } from "./utils/auth";

// A route protector based on login state and user role
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "recruiter") return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />

          {/* Candidate Protected Routes */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/saved-jobs"
            element={
              <ProtectedRoute allowedRole="candidate">
                <SavedJobsPage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Protected Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/profile"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/job-applicants/:jobId"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <JobApplicants />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
