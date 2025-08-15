import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry'
};

/**
 * Store tokens and user data
 */
export const storeTokens = async (accessToken, refreshToken, userData) => {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_KEYS.ACCESS_TOKEN, accessToken],
      [TOKEN_KEYS.REFRESH_TOKEN, refreshToken],
      [TOKEN_KEYS.USER_DATA, JSON.stringify(userData)],
      [TOKEN_KEYS.TOKEN_EXPIRY, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()] // 7 days
    ]);
    return true;
  } catch (error) {
    console.error('Error storing tokens:', error);
    return false;
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Get stored user data
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = async () => {
  try {
    const expiry = await AsyncStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    if (!expiry) return true;
    
    const expiryDate = new Date(expiry);
    const now = new Date();
    
    return now >= expiryDate;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Clear all stored tokens and user data
 */
export const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      TOKEN_KEYS.ACCESS_TOKEN,
      TOKEN_KEYS.REFRESH_TOKEN,
      TOKEN_KEYS.USER_DATA,
      TOKEN_KEYS.TOKEN_EXPIRY
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const accessToken = await getAccessToken();
    const isExpired = await isTokenExpired();
    
    return accessToken && !isExpired;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
