import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Jobs from "./pages/jobs/Jobs.jsx";
import Resumes from "./pages/resumes/Resumes.jsx";
import Analysis from "./pages/analysis/Analysis.jsx";
import Ranking from "./pages/ranking/Ranking.jsx";

// Route definitions are the only place layout choices are made: auth pages
// render standalone (no Navbar/Sidebar — a recruiter isn't "in the app" yet
// at login/register), every other page is wrapped in MainLayout +
// ProtectedRoute. Wrapping happens here, once, rather than each page
// importing and rendering MainLayout itself — a future layout change
// (e.g. adding a footer) touches this file, not seven page files.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
    </Routes>
  );
}
