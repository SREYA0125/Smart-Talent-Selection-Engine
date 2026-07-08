import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Loader from "./common/Loader.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // While AuthContext is still restoring session state from a stored token
  // (the GET /auth/me call that runs on mount), render a loader instead of
  // deciding anything yet. Without this check, a logged-in user refreshing
  // the page would see an incorrect flash-redirect to /login for a moment,
  // because isAuthenticated is still false at that instant — not because
  // they're logged out, but because the check hasn't finished running.
  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
