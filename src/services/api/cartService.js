import { apiClient, API_ENDPOINTS, buildUrl } from './config';

/**
 * Cart Service - Handles all cart/order related API calls
 * Cart items are orders with status='pending'
 */
export const cartService = {
  /**
   * Add item to cart (creates a new pending order)
   * @param {Object} params - Cart item parameters
   * @param {string} params.itemCode - MongoDB ObjectId of product
   * @param {number} params.qty - Quantity (default: 1)
   * @param {string} params.deliveryPincode - 6-digit pincode (optional)
   * @param {string} params.deliveryAddress - Delivery address (optional)
   * @param {string} params.deliveryExpectedDate - ISO date string (optional, default: 3 days from now)
   * @param {string} params.custPhoneNum - Customer phone number (optional)
   * @param {string} params.receiverMobileNum - Receiver phone number (optional)
   * @returns {Promise<Object>} Order data
   */
  async addToCart(params) {
    try {
      const url = API_ENDPOINTS.orders.addToCart.url;
      
      // Calculate delivery expected date (3 days from now)
      const deliveryDate = params.deliveryExpectedDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      
      const requestData = {
        itemCode: params.itemCode,
        qty: params.qty || 1,
        deliveryPincode: params.deliveryPincode || '',
        deliveryAddress: params.deliveryAddress || '',
        deliveryExpectedDate: deliveryDate,
        custPhoneNum: params.custPhoneNum || '',
        receiverMobileNum: params.receiverMobileNum || params.custPhoneNum || '',
      };

      const response = await apiClient.post(url, requestData);
      
      console.log('Add to cart API response:', {
        status: response.status,
        success: response.data?.success,
        message: response.data?.message,
        hasOrder: !!response.data?.order,
        hasError: !!response.data?.error,
        data: response.data
      });
      
      // Default to success if status is 200 and no explicit error
      // Only treat as error if there's an explicit error field or success is explicitly false
      const hasExplicitError = response.data?.error && 
                               response.data.error !== '' && 
                               !response.data.error.toLowerCase().includes('success');
      const hasExplicitFailure = response.data?.success === false;
      const isHttpSuccess = response.status === 200 || response.status === 201;
      
      // Treat as success if:
      // 1. Explicit success flag is true, OR
      // 2. HTTP status is 200/201 AND no explicit error AND (has order data OR has message OR success not explicitly false)
      const isSuccess = response.data?.success === true || 
                       (isHttpSuccess && 
                        !hasExplicitError && 
                        !hasExplicitFailure &&
                        (response.data?.order || response.data?.message || response.data));
      
      if (isSuccess) {
        return {
          success: true,
          data: response.data.order || response.data,
          message: response.data.message || 'Item added to cart successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to add item to cart',
        data: null,
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to add item to cart. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Get cart items (fetches all pending orders)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 50)
   * @returns {Promise<Object>} Cart items (pending orders)
   */
  async getCartItems(params = {}) {
    try {
      const url = API_ENDPOINTS.orders.getCartItems.url;
      const queryParams = {
        status: 'pending',
        page: params.page || 1,
        limit: params.limit || 50,
      };

      const response = await apiClient.get(url, { params: queryParams });
      
      // Handle both response formats: with success field or without
      if (response.data?.success !== false && response.status === 200) {
        // Filter orders to only include pending status (in case API doesn't filter)
        const allOrders = response.data.orders || response.data.data?.orders || [];
        const pendingOrders = allOrders.filter(order => 
          order.orderStatus === 'pending' || order.status === 'pending'
        );
        
        return {
          success: true,
          data: {
            orders: pendingOrders,
            pagination: response.data.pagination || response.data.data?.pagination || {},
          },
          message: response.data.message || 'Cart items retrieved successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to load cart items',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to load cart items. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Update order quantity
   * @param {string} leadId - Order leadId (e.g., 'CT-007')
   * @param {Object} params - Update parameters
   * @param {string} params.itemCode - MongoDB ObjectId from order.items[0].itemCode._id
   * @param {number} params.qty - New quantity
   * @returns {Promise<Object>} Updated order data
   */
  async updateQuantity(leadId, params) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.updateOrder.url, { leadId });
      
      const requestData = {
        items: [
          {
            itemCode: params.itemCode,
            qty: params.qty,
          },
        ],
      };

      const response = await apiClient.put(url, requestData);
      
      // Treat as success if status is 200 and no explicit error
      const isHttpSuccess = response.status === 200 || response.status === 201;
      const hasExplicitError = response.data?.error && response.data.error !== '';
      const hasExplicitFailure = response.data?.success === false;
      
      if (response.data?.success === true || (isHttpSuccess && !hasExplicitError && !hasExplicitFailure)) {
        return {
          success: true,
          data: response.data.order || response.data,
          message: response.data.message || 'Order updated successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to update order',
        data: null,
      };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to update quantity. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Remove item from cart (delete order)
   * @param {string} leadId - Order leadId (e.g., 'CT-007')
   * @returns {Promise<Object>} Success/error response
   */
  async removeFromCart(leadId) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.removeFromCart.url, { leadId });

      const response = await apiClient.delete(url);
      
      // Treat as success if status is 200/204 and no explicit error
      const isHttpSuccess = response.status === 200 || response.status === 201 || response.status === 204;
      const hasExplicitError = response.data?.error && response.data.error !== '';
      const hasExplicitFailure = response.data?.success === false;
      
      if (response.data?.success === true || (isHttpSuccess && !hasExplicitError && !hasExplicitFailure)) {
        return {
          success: true,
          message: response.data?.message || 'Item removed from cart successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to remove item from cart',
      };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to remove item from cart. Please try again.',
      };
    }
  },

  /**
   * Clear cart (delete all pending orders)
   * @param {Array} cartItems - Optional array of cart items to clear individually as fallback
   * @returns {Promise<Object>} Success/error response with clearedCount and ordersCleared
   */
  async clearCart(cartItems = null) {
    try {
      const url = API_ENDPOINTS.orders.clearCart.url;

      const response = await apiClient.delete(url);
      
      // Treat as success if status is 200/204 and no explicit error
      const isHttpSuccess = response.status === 200 || response.status === 201 || response.status === 204;
      const hasExplicitError = response.data?.error && response.data.error !== '';
      const hasExplicitFailure = response.data?.success === false;
      
      if (response.data?.success === true || (isHttpSuccess && !hasExplicitError && !hasExplicitFailure)) {
        return {
          success: true,
          message: response.data?.message || 'Cart cleared successfully',
          clearedCount: response.data?.clearedCount || 0,
          ordersCleared: response.data?.ordersCleared || [],
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to clear cart',
      };
    } catch (error) {
      console.error('Error clearing cart via API endpoint:', error);
      
      // If 404 error and we have cart items, try clearing them individually as fallback
      if (error.response?.status === 404 && cartItems && cartItems.length > 0) {
        console.log('Clear endpoint not found (404). Attempting to clear cart items individually...');
        return await this.clearCartFallback(cartItems);
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to clear cart. Please try again.',
      };
    }
  },

  /**
   * Fallback method to clear cart by removing items individually
   * @param {Array} cartItems - Array of cart items to remove
   * @returns {Promise<Object>} Success/error response
   */
  async clearCartFallback(cartItems) {
    try {
      const clearedItems = [];
      let successCount = 0;
      let failCount = 0;

      // Remove each item individually
      for (const item of cartItems) {
        try {
          const leadId = item.leadId || item.id;
          if (!leadId) {
            console.warn('Item missing leadId:', item);
            failCount++;
            continue;
          }

          const result = await this.removeFromCart(leadId);
          if (result.success) {
            successCount++;
            clearedItems.push({
              leadId: leadId,
              totalAmount: item.totalPrice || 0,
            });
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error removing item ${item.leadId}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        return {
          success: true,
          message: `Cart cleared successfully (${successCount} item${successCount !== 1 ? 's' : ''} removed)`,
          clearedCount: successCount,
          ordersCleared: clearedItems,
          fallback: true,
        };
      }

      return {
        success: false,
        error: `Failed to clear ${failCount} item${failCount !== 1 ? 's' : ''} from cart`,
      };
    } catch (error) {
      console.error('Error in clearCartFallback:', error);
      return {
        success: false,
        error: 'Unable to clear cart. Please try again.',
      };
    }
  },

  /**
   * Get cart summary (total items, total amount)
   * @returns {Promise<Object>} Cart summary data
   */
  async getCartSummary() {
    try {
      const url = API_ENDPOINTS.orders.getCartSummary.url;

      const response = await apiClient.get(url);
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.summary || {},
          message: response.data.message || 'Cart summary retrieved successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to load cart summary',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to load cart summary. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Transform API order to cart item format
   * @param {Object} order - Order from API
   * @returns {Object} Cart item model
   */
  transformOrderToCartItem(order) {
    if (!order || !order.items || order.items.length === 0) {
      console.warn('⚠️ Invalid order structure:', order);
      return null;
    }

    const item = order.items[0];
    const itemCode = item.itemCode || {};
    
    // Extract pricing data
    const unitPrice = item.unitPrice || 0;
    const quantity = item.qty || 1;
    const totalPrice = order.totalAmount || 0;
    
    // Calculate delivery charges: totalPrice includes delivery, so subtract item cost
    const itemSubtotal = unitPrice * quantity;
    const deliveryCharges = Math.max(0, totalPrice - itemSubtotal);

    // Extract product information
    const productName = itemCode.itemDescription || itemCode.name || 'Unknown Product';
    const productImage = itemCode.primaryImage || itemCode.image || null;
    const brand = order.vendorId?.name || itemCode.brand || 'Unknown';
    
    // Extract IDs - important for API calls
    const leadId = order.leadId || order._id;
    const itemCodeId = itemCode._id || item.itemCode || itemCode.id;

    const cartItem = {
      id: leadId,
      leadId: leadId,
      orderNumber: order.formattedLeadId || order.leadId || leadId,
      name: productName,
      image: productImage,
      brand: brand,
      currentPrice: unitPrice,
      totalPrice: totalPrice,
      deliveryCharges: deliveryCharges,
      quantity: quantity,
      itemCode: itemCodeId, // MongoDB ObjectId for quantity updates
      category: itemCode.category || '',
      subCategory: itemCode.subCategory || '',
      orderStatus: order.orderStatus || order.status || 'pending',
      vendorId: order.vendorId?._id || '',
      vendorName: order.vendorId?.name || brand,
      // Additional fields from API
      totalQty: order.totalQty || quantity,
      deliveryPincode: order.deliveryPincode || '',
      deliveryAddress: order.deliveryAddress || '',
      // Keep original order data for updates
      _orderData: order,
    };

    return cartItem;
  },

  /**
   * Place an order (changes status from 'pending' to 'placed')
   * @param {string} leadId - Order ID (e.g., 'CT-007' or MongoDB ObjectId)
   * @param {Object} orderData - Order placement data
   * @param {string} orderData.deliveryAddress - Full delivery address including city and state
   * @param {string} orderData.deliveryPincode - 6-digit pincode
   * @param {string} orderData.deliveryExpectedDate - ISO date string (default: 3 days from now)
   * @param {string} orderData.receiverMobileNum - 10-digit phone number
   * @returns {Promise<Object>} Order response
   */
  async placeOrder(leadId, orderData) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.placeOrder.url, { leadId });
      
      const requestData = {
        deliveryAddress: orderData.deliveryAddress,
        deliveryPincode: orderData.deliveryPincode,
        deliveryExpectedDate: orderData.deliveryExpectedDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        receiverMobileNum: orderData.receiverMobileNum,
        receiverName: orderData.receiverName || '',
        email: orderData.email || '',
        city: orderData.city || '',
        state: orderData.state || '',
      };

      const response = await apiClient.post(url, requestData);
      
      console.log('Place order API response:', {
        status: response.status,
        success: response.data?.success,
        message: response.data?.message,
        data: response.data
      });
      
      // Default to success if status is 200/201 and no explicit error
      const hasExplicitError = response.data?.error && 
                               response.data.error !== '' && 
                               !response.data.error.toLowerCase().includes('success');
      const hasExplicitFailure = response.data?.success === false;
      const isHttpSuccess = response.status === 200 || response.status === 201;
      
      const isSuccess = response.data?.success === true || 
                       (isHttpSuccess && !hasExplicitError && !hasExplicitFailure);
      
      if (isSuccess) {
        return {
          success: true,
          data: response.data.order || response.data,
          message: response.data.message || 'Order placed successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to place order',
        data: null,
      };
    } catch (error) {
      console.error('Error placing order:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to place order. Please try again.',
        data: null,
      };
    }
  },
};

