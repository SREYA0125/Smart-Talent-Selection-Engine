import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";

// AuthProvider wraps the whole app even though no real authentication logic
// exists yet — this is the foundation module's job: get the wiring in place
// (Router -> AuthProvider -> App) so the Authentication module, when built,
// only has to fill in AuthContext's internals, not restructure how the app
// boots.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
