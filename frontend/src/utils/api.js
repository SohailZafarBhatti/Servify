import axios from "axios";

// Base URL of your backend API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach token to all requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
