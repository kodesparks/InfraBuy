import { apiClient, API_ENDPOINTS } from './config';

/**
 * Verify email via link (GET ?token=...)
 * @param {string} token - Token from email link
 * @returns {Promise<{ success: boolean, data?: { accessToken, refreshToken, user }, error?: { message } }>}
 */
export const verifyEmailByLink = async (token) => {
  try {
    const url = `${API_ENDPOINTS.auth.verifyEmailLink.url}?token=${encodeURIComponent(token)}`;
    const response = await apiClient.get(url);
    if (response.data && (response.data.accessToken || response.data.access_token)) {
      return {
        success: true,
        data: {
          user: response.data.user || response.data,
          accessToken: response.data.accessToken || response.data.access_token,
          refreshToken: response.data.refreshToken || response.data.refresh_token,
        },
      };
    }
    return { success: false, error: { message: 'Invalid or expired link' } };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || 'Verification failed. Link may be expired.',
      },
    };
  }
};

/**
 * Verify email via OTP (POST { email, otp })
 * @param {string} email
 * @param {string} otp - 6-digit OTP
 */
export const verifyEmailByOtp = async (email, otp) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.auth.verifyEmailOtp.url, { email, otp });
    const data = response.data;
    if (data && (data.accessToken || data.access_token)) {
      return {
        success: true,
        data: {
          user: data.user || data,
          accessToken: data.accessToken || data.access_token,
          refreshToken: data.refreshToken || data.refresh_token,
        },
      };
    }
    return { success: false, error: { message: data?.message || 'Verification failed' } };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || 'Invalid or expired OTP. Please try again.',
      },
    };
  }
};

/**
 * Generate OTP – POST { phone } (10-digit). Backend may send OTP to email linked to phone.
 * @param {string} phone - 10-digit Indian mobile
 */
export const otpGenerate = async (phone) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.auth.otpGenerate.url, { phone: String(phone).trim() });
    const data = response.data;
    if (response.status === 200 && data) {
      return {
        success: true,
        data: {
          message: data.message || 'OTP sent',
          sendChannel: data.sendChannel || data.channel || 'email',
        },
      };
    }
    return { success: false, error: { message: data?.message || 'Failed to send OTP' } };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.',
      },
    };
  }
};

/**
 * Verify OTP – POST { phone, otp }. Returns tokens and user.
 * @param {string} phone - 10-digit
 * @param {string} otp - 6-digit
 */
export const otpVerify = async (phone, otp) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.auth.otpVerify.url, {
      phone: String(phone).trim(),
      otp: String(otp).trim(),
    });
    const data = response.data;
    if (data && (data.accessToken || data.access_token)) {
      return {
        success: true,
        data: {
          user: data.user || data,
          accessToken: data.accessToken || data.access_token,
          refreshToken: data.refreshToken || data.refresh_token,
        },
      };
    }
    return { success: false, error: { message: data?.message || 'Verification failed' } };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || 'Invalid or expired OTP. Please try again.',
      },
    };
  }
};
