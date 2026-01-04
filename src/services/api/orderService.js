import { apiClient, API_ENDPOINTS, buildUrl } from './config';

/**
 * Order Service - Handles all order-related API calls
 */
export const orderService = {
  /**
   * Get all customer orders
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status (optional)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 50)
   * @returns {Promise<Object>} Orders list with pagination
   */
  async getAllOrders(params = {}) {
    try {
      const url = API_ENDPOINTS.orders.getAll.url;
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      const response = await apiClient.get(fullUrl);
      
      if (response.data?.success !== false && response.status === 200) {
        return {
          success: true,
          data: {
            orders: response.data?.orders || response.data?.data?.orders || [],
            pagination: response.data?.pagination || response.data?.data?.pagination || {},
          },
          message: response.data?.message || 'Orders retrieved successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to load orders',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to load orders. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Get order details
   * @param {string} leadId - Order ID (e.g., 'CT-007' or MongoDB ObjectId)
   * @returns {Promise<Object>} Order details
   */
  async getOrderDetails(leadId) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.getDetails.url, { leadId });
      const response = await apiClient.get(url);
      
      if (response.data?.success !== false && response.status === 200) {
        // API returns: { order, paymentInfo, statusHistory, deliveryInfo, message, ... }
        // Return the full response data to preserve all fields including paymentInfo
        const apiData = response.data;
        const orderData = apiData?.order || apiData?.data?.order || apiData?.data || apiData;
        
        // Merge order data with other top-level fields (paymentInfo, statusHistory, deliveryInfo)
        const fullData = {
          ...orderData,
          // Preserve top-level fields from API response
          paymentInfo: apiData?.paymentInfo || orderData?.paymentInfo,
          statusHistory: apiData?.statusHistory || orderData?.statusHistory,
          deliveryInfo: apiData?.deliveryInfo || orderData?.deliveryInfo,
        };
        
        return {
          success: true,
          data: fullData,
          message: apiData?.message || 'Order details retrieved successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to load order details',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to load order details. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Get order tracking information
   * @param {string} leadId - Order ID
   * @returns {Promise<Object>} Tracking information
   */
  async getOrderTracking(leadId) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.getTracking.url, { leadId });
      const response = await apiClient.get(url);
      
      console.log('📡 Raw tracking response:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        hasTracking: !!response.data?.tracking,
        trackingKeys: response.data?.tracking ? Object.keys(response.data.tracking) : [],
      });
      
      if (response.data?.success !== false && response.status === 200) {
        const trackingData = response.data?.tracking || response.data?.data || response.data;
        console.log('✅ Extracted tracking data:', {
          hasDelivery: !!trackingData?.delivery,
          deliveryKeys: trackingData?.delivery ? Object.keys(trackingData.delivery) : [],
          driverName: trackingData?.delivery?.driverName,
        });
        
        return {
          success: true,
          data: trackingData,
          message: response.data?.message || 'Tracking information retrieved successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to load tracking information',
        data: null,
      };
    } catch (error) {
      console.error('❌ Error fetching tracking:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to load tracking information. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Check change eligibility for an order
   * @param {string} leadId - Order ID
   * @returns {Promise<Object>} Eligibility information
   */
  async checkChangeEligibility(leadId) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.checkChangeEligibility.url, { leadId });
      const response = await apiClient.get(url);
      
      if (response.data?.success !== false && response.status === 200) {
        return {
          success: true,
          data: {
            canChangeAddress: response.data?.canChangeAddress || false,
            canChangeDate: response.data?.canChangeDate || false,
            changeHistory: response.data?.changeHistory || [],
            restrictions: response.data?.restrictions || {},
          },
          message: response.data?.message || 'Eligibility checked successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to check eligibility',
        data: null,
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to check eligibility. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Change delivery address
   * @param {string} leadId - Order ID
   * @param {Object} addressData - Address change data
   * @param {string} addressData.newAddress - New delivery address (10-500 characters)
   * @param {string} addressData.reason - Reason for change (optional, max 200 characters)
   * @returns {Promise<Object>} Updated order
   */
  async changeDeliveryAddress(leadId, addressData) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.changeAddress?.url || '/api/order/customer/orders/{leadId}/address', { leadId });
      const response = await apiClient.put(url, {
        newAddress: addressData.newAddress,
        reason: addressData.reason || '',
      });
      
      if (response.data?.success !== false && response.status === 200) {
        return {
          success: true,
          data: response.data?.order || response.data?.data || response.data,
          message: response.data?.message || 'Address updated successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to update address',
        data: null,
      };
    } catch (error) {
      console.error('Error changing address:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to update address. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Change delivery date
   * @param {string} leadId - Order ID
   * @param {Object} dateData - Date change data
   * @param {string} dateData.newDeliveryDate - New delivery date (ISO format, must be future date)
   * @param {string} dateData.reason - Reason for change (optional, max 200 characters)
   * @returns {Promise<Object>} Updated order
   */
  async changeDeliveryDate(leadId, dateData) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.changeDate?.url || '/api/order/customer/orders/{leadId}/delivery-date', { leadId });
      const response = await apiClient.put(url, {
        newDeliveryDate: dateData.newDeliveryDate,
        reason: dateData.reason || '',
      });
      
      if (response.data?.success !== false && response.status === 200) {
        return {
          success: true,
          data: response.data?.order || response.data?.data || response.data,
          message: response.data?.message || 'Delivery date updated successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to update delivery date',
        data: null,
      };
    } catch (error) {
      console.error('Error changing delivery date:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to update delivery date. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Get payment status
   * @param {string} leadId - Order ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(leadId) {
    try {
      const url = buildUrl(API_ENDPOINTS.orders.getPaymentStatus.url, { leadId });
      const response = await apiClient.get(url);
      
      if (response.data?.success !== false && response.status === 200) {
        return {
          success: true,
          data: {
            paymentStatus: response.data?.paymentStatus || 'pending',
            paymentDetails: response.data?.paymentDetails || response.data?.data || {},
          },
          message: response.data?.message || 'Payment status retrieved successfully',
        };
      }

      return {
        success: false,
        error: response.data?.error || response.data?.message || 'Failed to load payment status',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Unable to load payment status. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Transform API order to UI order model
   * @param {Object} order - Order from API
   * @returns {Object} Transformed order
   */
  transformOrderToOrderModel(order) {
    if (!order) return null;

    const firstItem = order.items?.[0];
    const itemCode = firstItem?.itemCode || {};

    return {
      id: order.leadId || order._id,
      orderNumber: order.formattedLeadId || order.leadId || order._id,
      status: order.orderStatus || order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      orderDate: order.orderDate || order.createdAt,
      updateDate: order.updateDate || order.updatedAt,
      items: (order.items || []).map(item => ({
        id: item._id || item.itemCode?._id,
        name: item.itemCode?.itemDescription || item.itemCode?.name || 'Unknown Product',
        image: item.itemCode?.primaryImage || item.itemCode?.image || null,
        quantity: item.qty || item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalCost: item.totalCost || (item.unitPrice || 0) * (item.qty || 1),
      })),
      totalAmount: order.totalAmount || 0,
      deliveryCharges: order.deliveryCharges || 0,
      deliveryAddress: order.deliveryAddress || '',
      deliveryPincode: order.deliveryPincode || '',
      deliveryExpectedDate: order.deliveryExpectedDate || '',
      vendorId: order.vendorId?._id || order.vendorId || '',
      vendorName: order.vendorId?.name || '',
      invoiceNumber: order.invcNum || order.invoiceNumber || '',
      // Keep original order data for reference
      _orderData: order,
    };
  },
};

