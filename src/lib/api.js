import axios from 'axios';
import { getToken, clearToken } from './auth';

// Use relative path so Vite proxy handles the request (bypassing CORS)
const baseURL = '/api/v1';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
