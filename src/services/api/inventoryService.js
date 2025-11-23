import { apiClient, API_ENDPOINTS, buildUrl } from './config';

/**
 * Inventory Service - Handles all inventory/product related API calls
 */
export const inventoryService = {
  /**
   * Get inventory with pricing, delivery charges, and warehouse info
   * @param {Object} params - Query parameters
   * @param {string} params.pincode - Optional 6-digit pincode
   * @param {string} params.category - Optional category name (e.g., 'Cement', 'Iron')
   * @param {string} params.subCategory - Optional subcategory
   * @param {string} params.search - Optional search term
   * @param {number} params.page - Optional page number (default: 1)
   * @param {number} params.limit - Optional items per page (default: 50, max: 100)
   * @returns {Promise<Object>} Inventory data with pagination
   */
  async getInventoryWithPricing(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 50,
      };

      // Add optional parameters
      if (params.pincode) {
        queryParams.pincode = params.pincode;
      }
      if (params.category) {
        queryParams.category = params.category;
      }
      if (params.subCategory) {
        queryParams.subCategory = params.subCategory;
      }
      if (params.search) {
        queryParams.search = params.search;
      }

      const response = await apiClient.get(API_ENDPOINTS.inventory.getInventoryPricing.url, {
        params: queryParams,
      });

      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: {
            inventory: response.data.data.inventory || [],
            pagination: response.data.data.pagination || {},
            pincode: response.data.data.pincode,
            destination: response.data.data.destination,
          },
        };
      }

      return {
        success: false,
        error: 'Invalid response format',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching inventory:', error);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Unable to load products. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Get error message
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Log and include validation details if available
        if (errorData.details && Array.isArray(errorData.details)) {
          console.error('Validation error details:', errorData.details);
          const validationErrors = errorData.details.map(detail => {
            if (typeof detail === 'string') return detail;
            if (detail.message) return detail.message;
            if (detail.msg) return detail.msg;
            if (detail.path) return `${detail.path}: ${detail.message || detail.msg || JSON.stringify(detail)}`;
            return JSON.stringify(detail);
          }).join(', ');
          
          if (validationErrors) {
            errorMessage = `${errorMessage}. ${validationErrors}`;
          }
        }
      } else if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }

      return {
        success: false,
        error: errorMessage,
        data: null,
      };
    }
  },

  /**
   * Get inventory categories
   * @returns {Promise<Object>} Categories data
   */
  async getInventoryCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.inventory.getInventoryCategories.url);
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.categories || {},
        };
      }

      return {
        success: false,
        error: 'Failed to load categories',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: 'Unable to load categories. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Get subcategories for a specific category
   * @param {string} category - Category name (e.g., 'Cement')
   * @returns {Promise<Object>} Subcategories data
   */
  async getInventorySubcategories(category) {
    try {
      const url = buildUrl(API_ENDPOINTS.inventory.getInventorySubcategories.url, { category });
      const response = await apiClient.get(url);
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.subcategories || [],
        };
      }

      return {
        success: false,
        error: 'Failed to load subcategories',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return {
        success: false,
        error: 'Unable to load subcategories. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Get item pricing details
   * @param {string} itemId - Item ID (MongoDB ObjectId)
   * @param {string} pincode - Optional pincode for delivery calculation
   * @returns {Promise<Object>} Item pricing data
   */
  async getItemPricing(itemId, pincode = null) {
    try {
      const url = buildUrl(API_ENDPOINTS.inventory.getItemPricing.url, { itemId });
      const params = pincode ? { pincode } : {};
      
      const response = await apiClient.get(url, { params });
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data || {},
        };
      }

      return {
        success: false,
        error: 'Failed to load item pricing',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching item pricing:', error);
      return {
        success: false,
        error: 'Unable to load item pricing. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Get item images
   * @param {string} itemId - Item ID (MongoDB ObjectId)
   * @returns {Promise<Object>} Item images data
   */
  async getItemImages(itemId) {
    try {
      const url = buildUrl(API_ENDPOINTS.inventory.getItemImages.url, { itemId });
      const response = await apiClient.get(url);
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.images || [],
        };
      }

      return {
        success: false,
        error: 'Failed to load item images',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching item images:', error);
      return {
        success: false,
        error: 'Unable to load item images. Please try again.',
        data: null,
      };
    }
  },
};

/**
 * Map API inventory item to product card model
 * @param {Object} item - Inventory item from API
 * @returns {Object} Product card model
 */
export const mapInventoryItemToProduct = (item) => {
  // Calculate delivery charge
  const unitPrice = item.pricing?.unitPrice || 0;
  const totalPrice = item.totalPrice || unitPrice;
  const deliveryCharge = totalPrice - unitPrice;
  
  // Calculate discount
  const basePrice = item.pricing?.basePrice || 0;
  const discount = basePrice > unitPrice && basePrice > 0
    ? Math.round(((basePrice - unitPrice) / basePrice) * 100)
    : 0;

  // Get image
  const primaryImage = item.primaryImage || null;
  const fallbackImage = item.images && item.images.length > 0 ? item.images[0].url : null;
  const image = primaryImage || fallbackImage;

  // Get brand
  const brand = item.vendor?.name || item.vendor?.companyName || 'Unknown';

  // Get features (first 2 non-null)
  const features = [
    item.grade,
    item.specification,
    item.details,
  ].filter(f => f && f.trim() !== '').slice(0, 2);

  // Check stock
  const inStock = (item.warehouse?.stock?.available || 0) > 0;

  // Get item code
  const formattedItemCode = item.formattedItemCode || item.itemCode || item._id;

  return {
    id: item._id,
    _id: item._id,
    name: item.itemDescription || 'Product',
    itemDescription: item.itemDescription,
    image: image,
    images: item.images || [],
    brand: brand,
    currentPrice: unitPrice,
    basePrice: basePrice,
    totalPrice: totalPrice,
    deliveryCharge: deliveryCharge,
    isFreeDelivery: deliveryCharge === 0 && item.isDeliveryAvailable === true,
    isDeliveryAvailable: item.isDeliveryAvailable || false,
    deliveryReason: item.deliveryReason || null,
    distance: item.distance || item.warehouse?.distance || 0,
    warehouseName: item.warehouseName || item.warehouse?.warehouseName || 'Unknown',
    category: item.category,
    subCategory: item.subCategory,
    formattedItemCode: formattedItemCode,
    itemCode: item.itemCode,
    features: features,
    inStock: inStock,
    discount: discount,
    units: item.units || 'PIECE',
    grade: item.grade,
    specification: item.specification,
    details: item.details,
    vendor: item.vendor,
    warehouse: item.warehouse,
    // For backward compatibility
    type: item.subCategory,
    price: unitPrice,
    unit: item.units || 'PIECE',
  };
};

