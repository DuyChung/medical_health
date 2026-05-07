import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_URL}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medical_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function fileUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}
