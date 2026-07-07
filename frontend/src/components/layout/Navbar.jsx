import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

// The top bar is separate from Sidebar on purpose: Navbar holds identity/
// global actions (branding, current user, logout), Sidebar holds navigation.
// Different concerns, different files — a redesign of one doesn't risk
// breaking the other.
export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <Link to="/" className="font-semibold text-ink">
        Smart Talent Selection Engine
      </Link>
      <div className="text-sm text-slate">
        {/* Placeholder only — real user display and logout button are
            wired up once the Authentication module exists. */}
        {user ? user.name : "Not logged in"}
      </div>
    </header>
  );
}
