import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

/*
|--------------------------------------------------------------------------
| Admin Sidebar
|--------------------------------------------------------------------------
| Sidebar navigation specific to administrator roles. Displays active links
| for admin pages and a Logout option at the bottom.
|--------------------------------------------------------------------------
*/

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Recruiters", to: "/admin/recruiters" },
  { label: "Platform Jobs", to: "/admin/jobs" },
  { label: "Analytics", to: "/admin/analytics" },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white h-full flex flex-col justify-between">
      <nav className="flex flex-col p-4 gap-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Admin Panel</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-blue-50 text-accent" : "text-slate hover:bg-gray-50"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
