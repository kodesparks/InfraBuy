import { createResource } from './baseService';
import { clearTokens } from '../auth/tokenManager';

/**
 * Login user with email/phone and password
 */
export const loginUser = async (credentials) => {
  return createResource('/api/auth/login', credentials);
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken) => {
  return createResource('/api/auth/refresh-token', { refreshToken });
};

/**
 * Logout user
 */
export const logoutUser = async (refreshToken) => {
  try {
    // Call backend logout
    const result = await createResource('/api/auth/logout', { refreshToken });
    
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
