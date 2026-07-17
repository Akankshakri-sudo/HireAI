import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterProfile from "./pages/RecruiterProfile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import JobApplicants from "./pages/JobApplicants";

// A route protector based on login state and user role
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const defaultRedirect = user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard";
    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
