// A single loading indicator used anywhere the app is waiting on an async
// call (API requests in later modules). Centralized so "what loading looks
// like" is a design decision made once, not per-page.
export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-slate text-sm">
      <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      {label}
    </div>
  );
}
