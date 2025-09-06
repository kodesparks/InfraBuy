import { getDistance } from 'geolib';

export const distanceService = {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Object} from - {latitude, longitude}
   * @param {Object} to - {latitude, longitude}
   * @returns {number} Distance in kilometers
   */
  calculateDistance(from, to) {
    try {
      const distanceInMeters = getDistance(from, to);
      const distanceInKm = distanceInMeters / 1000;
      return Math.round(distanceInKm * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Distance calculation error:', error);
      throw new Error('Failed to calculate distance');
    }
  },

  /**
   * Calculate delivery charges based on distance and product type
   * @param {number} distance - Distance in km
   * @param {string} productType - 'cement', 'steel', or 'concrete'
   * @param {Object} warehouseConfig - Warehouse configuration
   * @returns {number} Delivery charges in rupees
   */
  calculateDeliveryCharges(distance, productType, warehouseConfig) {
    try {
      const ratePerKm = warehouseConfig.ratePerKm;
      const baseDeliveryCharge = 50; // Minimum delivery charge
      const calculatedCharge = distance * ratePerKm;
      
      // Return the higher of base charge or calculated charge
      return Math.max(baseDeliveryCharge, Math.round(calculatedCharge));
    } catch (error) {
      console.error('Delivery charge calculation error:', error);
      return 50; // Return minimum charge on error
    }
  },

  /**
   * Calculate total price including delivery charges
   * @param {number} basePrice - Base product price
   * @param {number} deliveryCharges - Delivery charges
   * @param {number} quantity - Quantity of items
   * @returns {number} Total price
   */
  calculateTotalPrice(basePrice, deliveryCharges, quantity = 1) {
    return (basePrice * quantity) + deliveryCharges;
  },

  /**
   * Get the nearest warehouse for a given location
   * @param {Object} userLocation - {latitude, longitude}
   * @param {Object} warehouses - Object containing warehouse configurations
   * @returns {Object} Nearest warehouse configuration
   */
  getNearestWarehouse(userLocation, warehouses) {
    try {
      let nearestWarehouse = null;
      let minDistance = Infinity;

      Object.keys(warehouses).forEach(key => {
        const warehouse = warehouses[key];
        const distance = this.calculateDistance(userLocation, warehouse.location);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestWarehouse = {
            ...warehouse,
            distance: minDistance,
            category: key,
          };
        }
      });

      return nearestWarehouse;
    } catch (error) {
      console.error('Nearest warehouse calculation error:', error);
      throw new Error('Failed to find nearest warehouse');
    }
  },
};
