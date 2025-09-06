import Geocoder from 'react-native-geocoding';
import { GOOGLE_MAPS_API_KEY } from '../config/googleMapsConfig';

// Initialize with your Google Maps API key
Geocoder.init(GOOGLE_MAPS_API_KEY);

export const geocodingService = {
  /**
   * Convert pincode to coordinates
   * @param {string} pincode - 6 digit pincode
   * @returns {Promise<{latitude: number, longitude: number, address: string}>}
   */
  async getCoordinatesFromPincode(pincode) {
    try {
      if (!pincode || pincode.length !== 6) {
        throw new Error('Invalid pincode format');
      }

      // Add "India" to the pincode for better geocoding results
      const searchQuery = `${pincode}, India`;
      
      const response = await Geocoder.from(searchQuery);
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;
        const address = result.formatted_address;
        
        return {
          latitude: location.lat,
          longitude: location.lng,
          address: address,
        };
      } else {
        throw new Error('No location found for this pincode');
      }
    } catch (error) {
      console.error(`Geocoding error for pincode ${pincode}:`, error.message);
      throw new Error(`Failed to get location for pincode ${pincode}: ${error.message}`);
    }
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
