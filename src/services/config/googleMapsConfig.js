// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCvQvl8Tho4uPSGbI5LAgNB2sk6oWBh5Xw';

// Google Maps API Configuration
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  baseUrl: 'https://maps.googleapis.com/maps/api',
  endpoints: {
    geocode: {
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      method: 'GET',
      requiresAuth: false,
      description: 'Convert addresses to coordinates and vice versa',
      queryParams: {
        address: 'string (required, e.g., "1600 Amphitheatre Parkway, Mountain View, CA")',
        latlng: 'string (optional, e.g., "40.714224,-73.961452")',
        key: 'string (required, API key)',
        language: 'string (optional, e.g., "en")',
        region: 'string (optional, e.g., "in" for India)',
      },
    },
    placesAutocomplete: {
      url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      method: 'GET',
      description: 'Autocomplete addresses as user types',
      queryParams: {
        input: 'string (required)',
        key: 'string (required)',
        types: 'string (optional, e.g., "address" or "geocode")',
        components: 'string (optional, e.g., "country:in")',
        sessiontoken: 'string (optional, unique per session)',
      },
    },
    placeDetails: {
      url: 'https://maps.googleapis.com/maps/api/place/details/json',
      method: 'GET',
      description: 'Get detailed information about a place',
      queryParams: {
        place_id: 'string (required)',
        key: 'string (required)',
        fields: 'string (optional, comma-separated)',
      },
    },
  },
  usage: {
    rateLimits: 'Refer to Google Maps Platform documentation',
    billing: 'Pay as you go pricing applies',
    quotas: 'Subject to Google Cloud Console quotas',
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
