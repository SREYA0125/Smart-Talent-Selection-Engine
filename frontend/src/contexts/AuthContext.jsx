import { createContext, useContext, useState, useEffect } from "react";
import { loginRequest, registerRequest, getMeRequest } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Starts true, not false: on first load we don't yet know whether a
  // stored token is valid, expired, or missing entirely. Every consumer
  // (ProtectedRoute, Navbar) needs to be able to tell "still checking"
  // apart from "checked, and you're logged out" — collapsing those two
  // states into one would make a logged-in user briefly flash to /login
  // on every page refresh, before restoreSession() finishes.
  const [loading, setLoading] = useState(true);

  // Runs once on mount. If a token exists in localStorage, it's verified
  // against the backend via GET /auth/me rather than trusted as-is — this
  // is what makes "refresh the browser and stay logged in" work, and it
  // also naturally handles an expired or tampered token: the request fails,
  // and the stale token is cleared instead of leaving a broken session
  // hanging around indefinitely.
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMeRequest();
        setUser(data.user);
        setToken(storedToken);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // login/register intentionally do NOT catch their own errors — they let
  // the error propagate to whichever page called them (Login.jsx,
  // Register.jsx), which knows how to turn it into UI (an error message,
  // a disabled-button reset). AuthContext's job is state management, not
  // presentation.
  const login = async (email, password) => {
    const { data } = await loginRequest(email, password);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await registerRequest(name, email, password);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Re-fetches the current user from the backend using whatever token is
  // already stored. Exposed separately from the internal restoreSession
  // effect so a future module could call it manually (e.g. after a
  // "update profile" action) without re-running the whole mount sequence.
  const loadUser = async () => {
    const { data } = await getMeRequest();
    setUser(data.user);
    return data.user;
  };

  // Derived from both user and token rather than either alone — a token
  // that failed verification (see restoreSession's catch block) is cleared
  // together with user, so checking both is technically redundant right
  // now, but makes this the one place "am I logged in" is decided, rather
  // than every consumer independently guessing which field to check.
  const isAuthenticated = Boolean(user && token);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
