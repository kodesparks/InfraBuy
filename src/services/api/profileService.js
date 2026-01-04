import { apiClient } from './config';
import { API_ENDPOINTS } from './config';

/**
 * Get current user's profile information
 * Note: GET /api/auth/user endpoint may not be available (404).
 * This function will return an error if the endpoint doesn't exist.
 * Use stored user data from login/update responses instead.
 */
export const getUserProfile = async () => {
  try {
    console.log('🌐 Fetching user profile...');
    const response = await apiClient.get(API_ENDPOINTS.auth.getUserDetails.url);
    
    if (response.data) {
      console.log('✅ Profile fetched successfully:', response.data);
      return {
        success: true,
        data: response.data,
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to fetch profile',
      },
    };
  } catch (error) {
    // If endpoint returns 404, it means the endpoint doesn't exist
    if (error.response?.status === 404) {
      console.warn('⚠️ GET /api/auth/user endpoint not available (404). Use stored user data or data from update responses.');
      return {
        success: false,
        error: {
          message: 'Profile endpoint not available',
          status: 404,
          details: 'GET /api/auth/user endpoint does not exist. Use user data from login/update responses.',
        },
      };
    }
    
    console.error('❌ Error fetching profile:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Failed to fetch profile',
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
};

/**
 * Update user profile (name, address, pincode)
 * PUT /api/users/{userId}
 */
export const updateProfile = async (userId, profileData) => {
  try {
    console.log('🌐 Updating profile...', { userId, profileData });
    const url = API_ENDPOINTS.user.updateProfile.url.replace('{userId}', userId);
    const response = await apiClient.put(url, profileData);
    
    if (response.data) {
      console.log('✅ Profile updated successfully:', response.data);
      // Return the user data from the response (response.data.user or response.data)
      const userData = response.data.user || response.data;
      return {
        success: true,
        data: userData,
        message: response.data.message || 'Profile updated successfully',
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to update profile',
      },
    };
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Failed to update profile',
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
};

/**
 * Update user email address
 * PUT /api/users/{userId}/email
 */
export const updateEmail = async (userId, emailData) => {
  try {
    console.log('🌐 Updating email...', { userId, emailData });
    const url = API_ENDPOINTS.user.updateEmail.url.replace('{userId}', userId);
    const response = await apiClient.put(url, emailData);
    
    if (response.data) {
      console.log('✅ Email updated successfully:', response.data);
      // Return the user data from the response
      const userData = response.data.user || response.data;
      return {
        success: true,
        data: userData,
        message: response.data.message || 'Email updated successfully',
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to update email',
      },
    };
  } catch (error) {
    console.error('❌ Error updating email:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Failed to update email',
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
};

/**
 * Update user mobile/phone number
 * PUT /api/users/{userId}/mobile
 */
export const updateMobile = async (userId, mobileData) => {
  try {
    console.log('🌐 Updating mobile...', { userId, mobileData });
    const url = API_ENDPOINTS.user.updateMobile.url.replace('{userId}', userId);
    const response = await apiClient.put(url, mobileData);
    
    if (response.data) {
      console.log('✅ Mobile updated successfully:', response.data);
      // Return the user data from the response
      const userData = response.data.user || response.data;
      return {
        success: true,
        data: userData,
        message: response.data.message || 'Mobile number updated successfully',
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to update mobile',
      },
    };
  } catch (error) {
    console.error('❌ Error updating mobile:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Failed to update mobile',
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
};

/**
 * Change user password
 * PUT /api/auth/change-password
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    console.log('🌐 Changing password...');
    const response = await apiClient.put(API_ENDPOINTS.auth.changePassword.url, {
      currentPassword,
      newPassword,
    });
    
    if (response.data) {
      console.log('✅ Password changed successfully:', response.data);
      return {
        success: true,
        message: response.data.message || 'Password changed successfully',
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to change password',
      },
    };
  } catch (error) {
    console.error('❌ Error changing password:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Failed to change password',
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
};

/**
 * Upload user avatar/profile picture
 * POST /api/users/{userId}/avatar
 */
export const uploadAvatar = async (userId, imageUri) => {
  try {
    console.log('🌐 Uploading avatar...', { userId, imageUri });
    const url = API_ENDPOINTS.user.uploadAvatar.url.replace('{userId}', userId);
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });
    
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data) {
      console.log('✅ Avatar uploaded successfully:', response.data);
      // Return the user data from the response
      const userData = response.data.user || response.data;
      return {
        success: true,
        data: { user: userData, ...response.data },
        message: response.data.message || 'Avatar uploaded successfully',
        avatarUrl: response.data.avatarUrl || userData?.avatar,
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to upload avatar',
      },
    };
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Failed to upload avatar',
        status: error.response?.status,
        details: error.response?.data,
      },
    };
  }
};

