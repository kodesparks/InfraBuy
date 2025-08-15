import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../auth/tokenManager';
import { refreshToken } from './loginService';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5000', // Remove /api from base URL
  TIMEOUT: 30000,
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenValue = await getRefreshToken();
        if (refreshTokenValue) {
          const refreshResult = await refreshToken(refreshTokenValue);
          
          if (refreshResult.success) {
            // Store new tokens
            await storeTokens(
              refreshResult.data.accessToken,
              refreshResult.data.refreshToken,
              refreshResult.data.user
            );

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResult.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        await clearTokens();
        // You might want to dispatch a logout action here
      }
    }

    return Promise.reject(error);
  }
);
