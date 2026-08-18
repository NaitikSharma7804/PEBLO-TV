import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "X-User-Role": "admin" // Default to admin for CMS usage
  }
});

export const fetchValidationReport = async () => {
  const response = await apiClient.get("/admin/validation-report");
  return response.data;
};

export const triggerPublish = async () => {
  const response = await apiClient.post("/admin/catalog/publish");
  return response.data;
};

export const uploadArtworkFile = async (formData: FormData) => {
  const response = await apiClient.post("/admin/artwork/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};