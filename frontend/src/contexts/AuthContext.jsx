import { createContext, useContext, useState } from "react";

// Why this file exists now, even though "do not implement authentication"
// is explicit for this module: every page in the app (Navbar showing a
// user's name, ProtectedRoute deciding what to render) needs some shape of
// "current user" to read from. Defining that shape here — even as inert
// placeholder state — means the Authentication module's job later is to
// fill in login()/logout()'s real implementation and populate this state
// from a real API call, not to invent the context from scratch and go
// back and rewire every consumer.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Placeholder state only. No localStorage read, no token, no API call —
  // that all belongs to the Authentication module.
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Placeholder functions with the shape the Authentication module will
  // implement for real. Kept here so components built in later modules
  // (Navbar, ProtectedRoute) can call useAuth() today without breaking
  // once real logic is added.
  const login = () => {
    // Intentionally empty in this module.
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
