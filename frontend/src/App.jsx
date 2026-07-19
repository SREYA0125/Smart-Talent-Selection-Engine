import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Jobs from "./pages/jobs/Jobs.jsx";
import Resumes from "./pages/resumes/Resumes.jsx";
import Analysis from "./pages/analysis/Analysis.jsx";
import Ranking from "./pages/ranking/Ranking.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import RecruiterManagement from "./pages/admin/RecruiterManagement.jsx";
import PlatformJobs from "./pages/admin/PlatformJobs.jsx";
import Analytics from "./pages/admin/Analytics.jsx";

import { useAuth } from "./hooks/useAuth.js";
import Loader from "./components/common/Loader.jsx";

// Dynamically redirects root endpoint depending on authenticated user role.
// Avoids hardcoding a recruiter redirect for administrators.
function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader label="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Recruiter Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Jobs />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Resumes />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Analysis />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ranking"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Ranking />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRole="ADMIN">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/recruiters"
        element={
          <RoleProtectedRoute allowedRole="ADMIN">
            <AdminLayout>
              <RecruiterManagement />
            </AdminLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <RoleProtectedRoute allowedRole="ADMIN">
            <AdminLayout>
              <PlatformJobs />
            </AdminLayout>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <RoleProtectedRoute allowedRole="ADMIN">
            <AdminLayout>
              <Analytics />
            </AdminLayout>
          </RoleProtectedRoute>
        }
      />
    </Routes>
  );
}
