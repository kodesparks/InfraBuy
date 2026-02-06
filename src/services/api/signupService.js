import { createResource } from './baseService';
import { API_ENDPOINTS } from './config';

/**
 * Register a new user.
 * If API returns requiresVerification: true (without tokens), do NOT auto-login; redirect to Verify Email with email.
 * If API returns user + tokens, store and go to home.
 * Handles EMAIL_EXISTS, PHONE_EXISTS, BOTH_EXIST with clear messages.
 */
export const registerUser = async (userData) => {
  try {
    const response = await createResource(API_ENDPOINTS.auth.signup.url, userData);
    const data = response.data;

    if (!response.success) {
      const code = (data?.code || data?.errorCode || '').toUpperCase();
      const msg = data?.message || response.error?.message || 'Failed to create account';
      let userMessage = msg;
      if (code === 'EMAIL_EXISTS') userMessage = 'This email is already registered. Try signing in or use another email.';
      else if (code === 'PHONE_EXISTS') userMessage = 'This phone number is already registered. Try signing in or use another number.';
      else if (code === 'BOTH_EXIST') userMessage = 'This email and phone are already registered. Try signing in.';
      return {
        success: false,
        error: { message: userMessage, code },
      };
    }

    // Customer signup may return requiresVerification: true without tokens
    if (data?.requiresVerification === true && !data?.accessToken && !data?.access_token) {
      return {
        success: true,
        requiresVerification: true,
        data: { email: userData.email, message: data.message },
      };
    }

    if (data?.accessToken || data?.access_token) {
      return {
        success: true,
        data: {
          user: data.user || data,
          accessToken: data.accessToken || data.access_token,
          refreshToken: data.refreshToken || data.refresh_token,
          message: data.message,
        },
      };
    }

    return response;
  } catch (error) {
    const res = error.response?.data;
    const code = (res?.code || res?.errorCode || '').toUpperCase();
    let message = res?.message || error.message || 'Failed to create account';
    if (code === 'EMAIL_EXISTS') message = 'This email is already registered. Try signing in or use another email.';
    else if (code === 'PHONE_EXISTS') message = 'This phone number is already registered. Try signing in or use another number.';
    else if (code === 'BOTH_EXIST') message = 'This email and phone are already registered. Try signing in.';
    return {
      success: false,
      error: { message },
    };
  }
};
