// Placeholder only, as required for this module — it renders its children
// unconditionally right now. The reason this file exists already, doing
// nothing yet, is so every route that will eventually need protection
// (Dashboard, Jobs, Resumes, Analysis, Ranking — see App.jsx) is already
// wrapped in <ProtectedRoute> today. When the Authentication module is
// built, the real redirect-if-not-logged-in check gets added inside this
// one file, and every route wrapped in it becomes protected instantly —
// no route definitions need to change.
export default function ProtectedRoute({ children }) {
  return children;
}
