// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = '';

// Google Maps API Configuration
export const GOOGLE_MAPS_CONFIG = {
  geocoding: {
    baseUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
    apiKey: GOOGLE_MAPS_API_KEY,
  },
};

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  currentEnv: __DEV__ ? 'development' : 'production',
};

// Logging configuration
export const LOG_CONFIG = {
  enableApiLogs: ENV_CONFIG.isDevelopment,
  enableDebugLogs: ENV_CONFIG.isDevelopment,
};
