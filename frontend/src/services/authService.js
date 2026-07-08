import api from "./api.js";

// Thin wrappers around the shared Axios instance — one function per backend
// endpoint, nothing else. AuthContext calls these instead of calling `api`
// directly, so the actual endpoint paths exist in exactly one place. If an
// endpoint path ever changes, this is the only file that needs to know.
export const loginRequest = (email, password) => api.post("/auth/login", { email, password });

export const registerRequest = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

export const getMeRequest = () => api.get("/auth/me");
