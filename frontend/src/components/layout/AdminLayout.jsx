import Navbar from "./Navbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

/*
|--------------------------------------------------------------------------
| Admin Layout
|--------------------------------------------------------------------------
| The shell layout specifically for Admin users. Includes the Navbar and
| the Admin Sidebar surrounding the main page content.
|--------------------------------------------------------------------------
*/

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
