import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL, STORAGE_KEYS } from '../constants';
import { safeStorage } from '../utils/storage';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await safeStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle unwrapping & 401 refresh
api.interceptors.response.use(
  (response) => {
    // Only unwrap if response.data.data is an array (paginated list)
    // Single objects like {id:..., title:...} should NOT be unwrapped again
    if (response.data && Array.isArray(response.data.data)) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await safeStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data: resData } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const tokenData = resData?.data || resData;

        await safeStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenData.accessToken);
        await safeStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenData.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        return api(originalRequest);
      } catch {
        await safeStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
        await safeStorage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
        // Redirect to login handled by auth store subscription
      }
    }
    return Promise.reject(error);
  },
);

export default api;
