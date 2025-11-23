import { createResource } from './baseService';
import { clearTokens } from '../auth/tokenManager';
import { API_ENDPOINTS } from './config';

/**
 * Login user with email and password
 */
export const loginUser = async (credentials) => {
  try {
    const response = await createResource(API_ENDPOINTS.auth.login.url, credentials);
    
    // Handle the new API response structure
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          message: response.data.message
        }
      };
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Login failed'
      }
    };
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken) => {
  return createResource(API_ENDPOINTS.auth.refreshToken.url, { refreshToken });
};

/**
 * Logout user
 */
export const logoutUser = async (refreshToken) => {
  try {
    // Call backend logout
    const result = await createResource(API_ENDPOINTS.auth.logout.url, { refreshToken });
    
    // Clear local tokens regardless of backend response
    await clearTokens();
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    // Even if backend fails, clear local tokens
    await clearTokens();
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }
};
