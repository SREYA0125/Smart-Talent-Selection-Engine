import axios from "axios";

// The single Axios instance every future service file (authService,
// jobService, resumeService, etc.) will import instead of calling axios
// directly. Centralizing this means the base URL, headers, and auth
// attachment logic exist in exactly one place.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attaches the JWT to every outgoing request, read fresh from
// localStorage on each call rather than captured once at import time — so
// logging in or out is reflected on the very next request without needing
// to recreate this instance.
//
// No token exists in localStorage yet, since the Authentication module
// hasn't been built — this interceptor is inert until that module starts
// writing a token there, by design.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
