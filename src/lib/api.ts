import axios from 'axios';
import { useAuth } from './auth-store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401s and token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('impr0ve-refresh-token');
        if (!refreshToken) {
          useAuth.getState().logout();
          return Promise.reject(error);
        }

        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;

        useAuth.setState({ token: accessToken });
        localStorage.setItem('impr0ve-refresh-token', newRefresh);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuth.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
