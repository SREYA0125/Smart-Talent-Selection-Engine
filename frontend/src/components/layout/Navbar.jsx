import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // logout() only clears state (context + localStorage) — it doesn't know
  // about routing. Navigation is triggered here, in the component that
  // actually has access to the router, keeping AuthContext free of
  // navigation concerns it shouldn't need to care about.
  const handleLogout = () => {
    logout();
    showToast("Logout successful!", "success");
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <Link to="/" className="font-semibold text-ink">
        Smart Talent Selection Engine
      </Link>

      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate">{user.name}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-ink hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
