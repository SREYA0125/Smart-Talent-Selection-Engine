import { NavLink } from "react-router-dom";

// Central place for the app's primary navigation. Adding a new top-level
// section later (e.g. Settings) means adding one entry to this array, not
// hunting through multiple files for hardcoded links.
const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Jobs", to: "/jobs" },
  { label: "Resumes", to: "/resumes" },
  { label: "Analysis", to: "/analysis" },
  { label: "Ranking", to: "/ranking" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white h-full">
      <nav className="flex flex-col p-4 gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? "bg-blue-50 text-accent" : "text-slate hover:bg-gray-50"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
