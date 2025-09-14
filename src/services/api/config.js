import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../auth/tokenManager';
import { refreshToken } from './loginService';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.infraxpert.in',
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

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('🌐 NETWORK REQUEST:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      timestamp: new Date().toISOString()
    });
    
    return config;
  },
  (error) => {
    console.log('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ NETWORK RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response;
  },
  async (error) => {
    // Log error response
    console.log('❌ NETWORK ERROR:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });

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
