import Geocoder from 'react-native-geocoding';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_CONFIG } from '../config/googleMapsConfig';
import { apiClient, API_ENDPOINTS } from '../api/config';

// Initialize with your Google Maps API key
Geocoder.init(GOOGLE_MAPS_API_KEY);

export const geocodingService = {
  /**
   * Convert pincode to coordinates using backend API (preferred method)
   * @param {string} pincode - 6 digit pincode
   * @returns {Promise<{latitude: number, longitude: number, address: string, city?: string, state?: string, district?: string}>}
   */
  async getCoordinatesFromPincode(pincode) {
    // Step 1: Validate pincode format client-side first
    if (!pincode || pincode.length !== 6) {
      throw new Error('Please enter a valid 6-digit pincode');
    }

    if (!this.validatePincode(pincode)) {
      throw new Error('Please enter a valid 6-digit pincode');
    }

    // Step 2: Try backend API first
    try {
      const backendResponse = await apiClient.post(
        API_ENDPOINTS.location.validatePincode.url,
        { pincode },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      // Step 3: Check HTTP status code
      const httpStatus = backendResponse.status;

      // Step 4: Parse response body and check response.success flag
      const responseData = backendResponse.data;

      // Step 5: If success=true, use response.data.location
      if (httpStatus === 200 && responseData?.success === true && responseData?.data?.isValid) {
        const locationData = responseData.data.location;
        
        // Handle both response formats:
        // Format 1: { location: { coordinates: { latitude, longitude }, address, ... } }
        // Format 2: { location: { latitude, longitude, address, ... } }
        let latitude, longitude;
        
        if (locationData?.coordinates) {
          // Nested coordinates format
          latitude = locationData.coordinates.latitude;
          longitude = locationData.coordinates.longitude;
        } else if (locationData?.latitude && locationData?.longitude) {
          // Flat format
          latitude = locationData.latitude;
          longitude = locationData.longitude;
        }
        
        // Only return if we have valid coordinates
        if (latitude && longitude) {
          return {
            latitude,
            longitude,
            address: locationData.address || `${pincode}, India`,
            city: locationData.city,
            state: locationData.state,
            district: locationData.district,
            region: locationData.region,
          };
        }
      }

      // Step 6: If success=false or error status, extract error message
      if (responseData?.success === false || !responseData?.data?.isValid) {
        const errorMessage = this.extractErrorMessage(responseData, null);
        throw new Error(errorMessage);
      }
    } catch (backendError) {
      // Step 7: Check error.origin field for detailed error information
      const errorMessage = this.extractErrorMessage(
        backendError.response?.data,
        backendError
      );

      // Log error details for debugging
      console.error(`Backend geocoding error for pincode ${pincode}:`, {
        httpStatus: backendError.response?.status,
        errorMessage,
        responseData: backendError.response?.data,
        origin: backendError.response?.data?.origin || backendError.origin,
        fullError: backendError,
      });

      // Step 8: If error is geocoding-related, use Google Maps API fallback
      const shouldUseFallback = this.shouldUseFallbackGeocoding(backendError);

      if (shouldUseFallback) {
        console.warn('Using Google Maps API as fallback for pincode:', pincode);
        return await this.fallbackToGoogleMaps(pincode);
      }

      // Step 9: Show appropriate error message to user
      throw new Error(errorMessage);
    }
  },

  /**
   * Extract error message from response data or error object
   * Priority: response.error > response.message > response.origin > error.response.data > default
   * @param {Object} responseData - Response data from API
   * @param {Error} error - Error object
   * @returns {string} Error message
   */
  extractErrorMessage(responseData, error) {
    // Priority 1: Check response.body.error (primary)
    if (responseData?.error) {
      return this.getUserFriendlyMessage(responseData.error);
    }

    // Priority 2: Check response.body.message (secondary)
    if (responseData?.message) {
      return this.getUserFriendlyMessage(responseData.message);
    }

    // Priority 3: Check response.body.origin (detailed error data)
    if (responseData?.origin) {
      const originData = responseData.origin;
      
      // Check nested error details
      if (originData.errorDetails?.message) {
        return this.getUserFriendlyMessage(originData.errorDetails.message);
      }
      
      if (originData.message) {
        return this.getUserFriendlyMessage(originData.message);
      }
      
      if (originData.geocodingError) {
        return this.getUserFriendlyMessage(originData.geocodingError);
      }
      
      // If origin is a string
      if (typeof originData === 'string') {
        return this.getUserFriendlyMessage(originData);
      }
    }

    // Priority 4: Check error.response.data
    if (error?.response?.data) {
      const errorData = error.response.data;
      if (errorData.error) return this.getUserFriendlyMessage(errorData.error);
      if (errorData.message) return this.getUserFriendlyMessage(errorData.message);
      if (errorData.origin) {
        const originData = errorData.origin;
        if (originData.errorDetails?.message) {
          return this.getUserFriendlyMessage(originData.errorDetails.message);
        }
      }
    }

    // Priority 5: Check error.origin directly
    if (error?.origin) {
      const originData = error.origin;
      if (originData?.errorDetails?.message) {
        return this.getUserFriendlyMessage(originData.errorDetails.message);
      }
      if (originData?.message) {
        return this.getUserFriendlyMessage(originData.message);
      }
      if (typeof originData === 'string') {
        return this.getUserFriendlyMessage(originData);
      }
    }

    // Priority 6: Check HTTP status code
    if (error?.response?.status) {
      const httpStatus = error.response.status;
      return this.getHttpStatusErrorMessage(httpStatus);
    }

    // Priority 7: Check error message
    if (error?.message) {
      return this.getUserFriendlyMessage(error.message);
    }

    // Default message
    return 'Failed to validate pincode. Please try again.';
  },

  /**
   * Determine if fallback geocoding should be used
   * @param {Error} error - Error object
   * @returns {boolean} True if fallback should be used
   */
  shouldUseFallbackGeocoding(error) {
    const httpStatus = error?.response?.status;
    const responseData = error?.response?.data;

    // Use fallback for:
    // 1. Backend returns 500 error
    if (httpStatus === 500) return true;

    // 2. Backend returns success=false with geocoding error
    if (responseData?.success === false) {
      const errorMessage = responseData.error || responseData.message || '';
      if (errorMessage.toLowerCase().includes('geocoding') || 
          errorMessage.toLowerCase().includes('server') ||
          responseData.origin?.geocodingProvider) {
        return true;
      }
    }

    // 3. Network timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return true;
    }

    // 4. Error message indicates geocoding service failure
    if (error.message?.toLowerCase().includes('geocoding') ||
        error.message?.toLowerCase().includes('server')) {
      return true;
    }

    return false;
  },

  /**
   * Fallback to Google Maps Geocoding API
   * @param {string} pincode - 6 digit pincode
   * @returns {Promise<{latitude: number, longitude: number, address: string}>}
   */
  async fallbackToGoogleMaps(pincode) {
    try {
      const searchQuery = `${pincode}, India`;
      const response = await Geocoder.from(searchQuery);

      // Check for API errors in response
      if (response.status && response.status !== 'OK') {
        const errorMessage = this.getGoogleMapsErrorMessage(response.status);
        throw new Error(errorMessage);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;
        const address = result.formatted_address;

        // Parse address components for city, state, etc.
        const addressComponents = result.address_components || [];
        let city = '';
        let state = '';
        let district = '';

        addressComponents.forEach((component) => {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('administrative_area_level_2')) {
            district = component.long_name;
          }
        });

        return {
          latitude: location.lat,
          longitude: location.lng,
          address: address,
          city: city || undefined,
          state: state || undefined,
          district: district || undefined,
        };
      } else {
        throw new Error('Unable to find location for this pincode. Please try another pincode.');
      }
    } catch (error) {
      // Handle Google Maps API errors
      let errorMessage = 'Unable to find location for this pincode. Please try another pincode.';

      if (error.origin) {
        const originData = error.origin;
        if (originData?.status) {
          errorMessage = this.getGoogleMapsErrorMessage(originData.status);
        } else if (originData?.error_message) {
          errorMessage = this.getUserFriendlyMessage(originData.error_message);
        }
      } else if (error.message) {
        errorMessage = this.getUserFriendlyMessage(error.message);
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Get user-friendly error message from Google Maps API status
   * @param {string} status - Google Maps API status code
   * @returns {string} User-friendly error message
   */
  getGoogleMapsErrorMessage(status) {
    const errorMessages = {
      ZERO_RESULTS: 'Unable to find location for this pincode. Please try another pincode.',
      OVER_QUERY_LIMIT: 'Geocoding service is temporarily unavailable. Please try again later.',
      REQUEST_DENIED: 'Geocoding request was denied. Please contact support.',
      INVALID_REQUEST: 'Invalid pincode format. Please enter a valid 6-digit Indian pincode.',
      UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
    };

    return errorMessages[status] || 'Unable to find location for this pincode. Please try another pincode.';
  },

  /**
   * Get user-friendly error message based on HTTP status code
   * @param {number} httpStatus - HTTP status code
   * @returns {string} User-friendly error message
   */
  getHttpStatusErrorMessage(httpStatus) {
    const errorMessages = {
      200: 'Failed to validate pincode. Please try again.',
      400: 'Please enter a valid 6-digit pincode',
      404: 'Pincode not found. Please check and try again.',
      500: 'Unable to validate pincode right now. Please try again.',
      503: 'Service temporarily unavailable. Please try again later.',
    };

    return errorMessages[httpStatus] || 'Failed to validate pincode. Please try again.';
  },

  /**
   * Convert error message to user-friendly message
   * @param {string} message - Error message
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(message) {
    if (!message) return 'Failed to validate pincode. Please try again.';

    const messageLower = message.toLowerCase();

    // Map common error messages to user-friendly ones
    if (messageLower.includes('invalid') || messageLower.includes('format')) {
      return 'Please enter a valid 6-digit pincode';
    }
    if (messageLower.includes('not found') || messageLower.includes('zero results')) {
      return 'Pincode not found. Please check and try again.';
    }
    if (messageLower.includes('server') || messageLower.includes('500')) {
      return 'Unable to validate pincode right now. Please try again.';
    }
    if (messageLower.includes('network') || messageLower.includes('connection')) {
      return 'Network error. Please check your internet connection.';
    }
    if (messageLower.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (messageLower.includes('geocoding')) {
      return 'Unable to find location for this pincode. Please try another pincode.';
    }

    // Return original message if no mapping found
    return message;
  },

  /**
   * Validate pincode format
   * @param {string} pincode
   * @returns {boolean}
   */
  validatePincode(pincode) {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  },

  /**
   * Get delivery time estimate based on distance
   * @param {number} distance - Distance in km
   * @returns {string}
   */
  getDeliveryTimeEstimate(distance) {
    if (distance <= 10) {
      return 'Same day delivery available';
    } else if (distance <= 50) {
      return '1-2 days delivery available';
    } else if (distance <= 100) {
      return '2-3 days delivery available';
    } else if (distance <= 200) {
      return '3-5 days delivery available';
    } else {
      return '5-7 days delivery available';
    }
  },
};
