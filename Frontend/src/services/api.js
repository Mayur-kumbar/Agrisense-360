// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/",
  timeout: 15000,
});

// attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("as_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

export default api;
