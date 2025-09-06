import { WAREHOUSE_LOCATIONS, PRODUCT_CATEGORY_MAPPING, BASE_PRODUCT_PRICES } from '../config/warehouseConfig';
import { distanceService } from '../location/distanceService';
import { LOG_CONFIG } from '../config/googleMapsConfig';

// Logging utility
const logPricing = (message, data = null) => {
  if (LOG_CONFIG.enableDebugLogs) {
    console.log(`[PRICING SERVICE] ${message}`, data || '');
  }
};

export const pricingService = {
  /**
   * Calculate total price including delivery charges for a product
   * @param {Object} product - Product object with base price
   * @param {string} categoryName - Product category name
   * @param {Object} userLocation - User's location coordinates
   * @param {number} quantity - Quantity of items
   * @returns {Object} Price breakdown
   */
  calculateProductPrice(product, categoryName, userLocation, quantity = 1) {
    try {
      logPricing(`Calculating price for ${product.name}`, {
        categoryName,
        quantity,
        userLocation
      });

      const categoryKey = PRODUCT_CATEGORY_MAPPING[categoryName];
      const warehouse = WAREHOUSE_LOCATIONS[categoryKey];
      
      if (!warehouse) {
        logPricing(`No warehouse found for category: ${categoryName}`);
        return {
          basePrice: product.price,
          deliveryCharges: 0,
          totalPrice: product.price * quantity,
          breakdown: {
            productPrice: product.price * quantity,
            deliveryCharges: 0,
            total: product.price * quantity
          }
        };
      }

      // Calculate distance and delivery charges
      const distance = distanceService.calculateDistance(userLocation, warehouse.location);
      const deliveryCharges = distanceService.calculateDeliveryCharges(distance, categoryKey, warehouse);
      
      // Calculate total price
      const productPrice = product.price * quantity;
      const totalPrice = productPrice + deliveryCharges;

      const priceBreakdown = {
        basePrice: product.price,
        deliveryCharges: deliveryCharges,
        totalPrice: totalPrice,
        distance: distance,
        warehouse: warehouse.name,
        breakdown: {
          productPrice: productPrice,
          deliveryCharges: deliveryCharges,
          total: totalPrice
        }
      };

      logPricing(`Price calculated successfully`, priceBreakdown);
      return priceBreakdown;
    } catch (error) {
      logPricing(`Error calculating price: ${error.message}`);
      return {
        basePrice: product.price,
        deliveryCharges: 0,
        totalPrice: product.price * quantity,
        error: error.message
      };
    }
  },

  /**
   * Get delivery information for a category
   * @param {string} categoryName - Product category name
   * @param {Object} userLocation - User's location coordinates
   * @returns {Object} Delivery information
   */
  getDeliveryInfo(categoryName, userLocation) {
    try {
      const categoryKey = PRODUCT_CATEGORY_MAPPING[categoryName];
      const warehouse = WAREHOUSE_LOCATIONS[categoryKey];
      
      if (!warehouse || !userLocation) {
        return null;
      }

      const distance = distanceService.calculateDistance(userLocation, warehouse.location);
      const deliveryCharges = distanceService.calculateDeliveryCharges(distance, categoryKey, warehouse);
      
      return {
        warehouse: warehouse.name,
        distance: distance,
        deliveryCharges: deliveryCharges,
        deliveryTime: this.getDeliveryTimeEstimate(distance),
        ratePerKm: warehouse.ratePerKm
      };
    } catch (error) {
      logPricing(`Error getting delivery info: ${error.message}`);
      return null;
    }
  },

  /**
   * Get delivery time estimate based on distance
   * @param {number} distance - Distance in km
   * @returns {string}
   */
  getDeliveryTimeEstimate(distance) {
    if (distance <= 10) return 'Same day delivery available';
    if (distance <= 50) return '1-2 days delivery available';
    if (distance <= 100) return '2-3 days delivery available';
    if (distance <= 200) return '3-5 days delivery available';
    return '5-7 days delivery available';
  },

  /**
   * Get all warehouse information for a user location
   * @param {Object} userLocation - User's location coordinates
   * @returns {Object} All warehouse delivery information
   */
  getAllWarehouseInfo(userLocation) {
    const warehouseInfo = {};
    
    Object.keys(WAREHOUSE_LOCATIONS).forEach(category => {
      const categoryName = Object.keys(PRODUCT_CATEGORY_MAPPING).find(
        key => PRODUCT_CATEGORY_MAPPING[key] === category
      );
      
      if (categoryName) {
        warehouseInfo[category] = this.getDeliveryInfo(categoryName, userLocation);
      }
    });

    return warehouseInfo;
  }
};
