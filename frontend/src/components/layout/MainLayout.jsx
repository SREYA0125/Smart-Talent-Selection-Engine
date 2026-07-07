import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

// The shared shell for every authenticated screen: Navbar on top, Sidebar
// + page content below it. Pages themselves (Dashboard, Jobs, etc.) never
// render Navbar/Sidebar directly — they're wrapped in this once, in
// App.jsx's route definitions, so the layout can change in one place
// without touching every page.
//
// flex-col on the outer div + flex-1 on the row below is what makes this
// responsive: on a narrow viewport, the Sidebar and content still sit
// side-by-side here, but Sidebar's fixed width (see Sidebar.jsx) and the
// content area's own overflow handling are what keep this usable on
// smaller screens without a full mobile-nav redesign, which is left for
// a later polish pass.
export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
