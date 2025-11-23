import { createResource } from './baseService';
import { API_ENDPOINTS } from './config';

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    const response = await createResource(API_ENDPOINTS.auth.signup.url, userData);
    
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
        message: error.message || 'Failed to create account'
      }
    };
  }
};
