import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Loader from "./common/Loader.jsx";

/*
|--------------------------------------------------------------------------
| Role Protected Route
|--------------------------------------------------------------------------
| Guards admin-specific routes. Checks that the user is logged in and
| matches the required role. Redirects unauthorized users to the recruiter
| dashboard or login.
|--------------------------------------------------------------------------
*/

export default function RoleProtectedRoute({ children, allowedRole = "ADMIN" }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== allowedRole) {
    // If role doesn't match, send recruiter back to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
