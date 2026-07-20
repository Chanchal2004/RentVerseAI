import axios from "axios";

export const API_BASE = process.env.REACT_APP_API_URL;

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function fileUrl(storagePath) {
  if (!storagePath) return "";

  if (storagePath.startsWith("http")) {
    return storagePath;
  }

  return `${API_BASE}/files/${storagePath}`;
}