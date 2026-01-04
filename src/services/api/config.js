import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens, getUserData } from '../auth/tokenManager';
import { refreshToken } from './loginService';
import { navigateToLogin } from '../navigation/navigationService';

// API Configuration
export const API_CONFIG = {
  baseUrl: 'https://api.infraxpert.in',
  apiVersion: 'v1',
  BASE_URL: 'https://api.infraxpert.in', // Keep for backward compatibility
  TIMEOUT: 30000,
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  authentication: {
    type: 'Bearer Token',
    headerName: 'Authorization',
    headerFormat: 'Bearer {accessToken}',
    tokenStorage: 'Secure storage recommended',
    refreshTokenEndpoint: '/api/auth/refresh-token',
  },
  sessionSource: 'cookie',
};

// API Endpoints Configuration
export const API_ENDPOINTS = {
  auth: {
    login: {
      url: '/api/auth/login',
      method: 'POST',
      requiresAuth: false,
    },
    signup: {
      url: '/api/auth/signup',
      method: 'POST',
      requiresAuth: false,
    },
    refreshToken: {
      url: '/api/auth/refresh-token',
      method: 'POST',
      requiresAuth: false,
    },
    logout: {
      url: '/api/auth/logout',
      method: 'POST',
      requiresAuth: true,
    },
    getUserDetails: {
      url: '/api/auth/user',
      method: 'GET',
      requiresAuth: true,
    },
    forgotPassword: {
      url: '/api/auth/forgot-password',
      method: 'POST',
      requiresAuth: false,
    },
    changePassword: {
      url: '/api/auth/change-password',
      method: 'PUT',
      requiresAuth: true,
    },
  },
  inventory: {
    getInventoryPricing: {
      url: '/api/inventory/pricing',
      method: 'GET',
      requiresAuth: false,
      description: 'Get all products with pricing, delivery charges, and nearest warehouse info',
    },
    getInventoryItems: {
      url: '/api/inventory',
      method: 'GET',
      requiresAuth: true,
      description: 'Get inventory items without pricing (admin/vendor only)',
    },
    getInventoryCategories: {
      url: '/api/inventory/categories',
      method: 'GET',
      requiresAuth: false,
      description: 'Get all available product categories',
    },
    getInventorySubcategories: {
      url: '/api/inventory/categories/{category}/subcategories',
      method: 'GET',
      requiresAuth: false,
      description: 'Get subcategories for a specific category',
    },
    getItemPricing: {
      url: '/api/inventory/pricing/{itemId}',
      method: 'GET',
      requiresAuth: false,
      description: 'Get detailed pricing for a specific item with delivery calculation',
    },
    getItemImages: {
      url: '/api/inventory/{itemId}/images',
      method: 'GET',
      requiresAuth: false,
      description: 'Get all images for a specific product',
    },
  },
  orders: {
    addToCart: {
      url: '/api/order/cart/add',
      method: 'POST',
      requiresAuth: true,
    },
    getCustomerOrders: {
      url: '/api/order/customer/orders',
      method: 'GET',
      requiresAuth: true,
    },
    getOrderDetails: {
      url: '/api/order/customer/orders/{leadId}',
      method: 'GET',
      requiresAuth: true,
    },
    getCartItems: {
      url: '/api/order/customer/orders',
      method: 'GET',
      requiresAuth: true,
      defaultParams: { status: 'pending' },
    },
    getCartSummary: {
      url: '/api/order/customer/orders/summary',
      method: 'GET',
      requiresAuth: true,
    },
    clearCart: {
      url: '/api/order/customer/orders/clear',
      method: 'DELETE',
      requiresAuth: true,
    },
    updateOrder: {
      url: '/api/order/customer/orders/{leadId}',
      method: 'PUT',
      requiresAuth: true,
      description: 'Update order quantity and details',
    },
    removeFromCart: {
      url: '/api/order/customer/orders/{leadId}',
      method: 'DELETE',
      requiresAuth: true,
    },
    removeSpecificItemFromCart: {
      url: '/api/order/customer/orders/{leadId}/items',
      method: 'DELETE',
      requiresAuth: true,
    },
    placeOrder: {
      url: '/api/order/customer/orders/{leadId}/place',
      method: 'POST',
      requiresAuth: true,
    },
    processPayment: {
      url: '/api/order/customer/orders/{leadId}/payment',
      method: 'POST',
      requiresAuth: true,
    },
    getPaymentStatus: {
      url: '/api/order/customer/orders/{leadId}/payment',
      method: 'GET',
      requiresAuth: true,
    },
    getOrderTracking: {
      url: '/api/order/customer/orders/{leadId}/tracking',
      method: 'GET',
      requiresAuth: true,
    },
    getAll: {
      url: '/api/order/customer/orders',
      method: 'GET',
      requiresAuth: true,
    },
    getDetails: {
      url: '/api/order/customer/orders/{leadId}',
      method: 'GET',
      requiresAuth: true,
    },
    getTracking: {
      url: '/api/order/customer/orders/{leadId}/tracking',
      method: 'GET',
      requiresAuth: true,
    },
    checkChangeEligibility: {
      url: '/api/order/customer/orders/{leadId}/change-history',
      method: 'GET',
      requiresAuth: true,
    },
    changeAddress: {
      url: '/api/order/customer/orders/{leadId}/address',
      method: 'PUT',
      requiresAuth: true,
    },
    changeDate: {
      url: '/api/order/customer/orders/{leadId}/delivery-date',
      method: 'PUT',
      requiresAuth: true,
    },
  },
  location: {
    validatePincode: {
      url: '/api/location/validate-pincode',
      method: 'POST',
      requiresAuth: false,
      description: 'Validate Indian pincode and get location details',
    },
    calculateDelivery: {
      url: '/api/delivery/calculate',
      method: 'POST',
      requiresAuth: false,
      description: 'Calculate delivery charges for items to a pincode',
    },
    estimateDeliveryTime: {
      url: '/api/delivery/estimate-time/{pincode}',
      method: 'GET',
      requiresAuth: false,
      description: 'Get estimated delivery time for a pincode',
    },
  },
  user: {
    updateProfile: {
      url: '/api/users/{userId}',
      method: 'PUT',
      requiresAuth: true,
    },
    updateEmail: {
      url: '/api/users/{userId}/email',
      method: 'PUT',
      requiresAuth: true,
    },
    updateMobile: {
      url: '/api/users/{userId}/mobile',
      method: 'PUT',
      requiresAuth: true,
    },
    uploadAvatar: {
      url: '/api/users/{userId}/avatar',
      method: 'POST',
      requiresAuth: true,
      contentType: 'multipart/form-data',
    },
  },
  contact: {
    sendContactMessage: {
      url: '/api/contact',
      method: 'POST',
      requiresAuth: false,
    },
  },
};

// Order Status Mappings
export const ORDER_STATUS = {
  apiStatuses: {
    pending: 'Item in cart',
    order_placed: 'Order placed, awaiting vendor confirmation',
    vendor_accepted: 'Order accepted by vendor - Payment required',
    payment_done: 'Payment completed',
    order_confirmed: 'Order confirmed and being prepared',
    truck_loading: 'Loading onto delivery vehicle',
    shipped: 'Dispatched from warehouse',
    in_transit: 'In transit to delivery location',
    out_for_delivery: 'Out for delivery today',
    delivered: 'Delivered successfully',
    cancelled: 'Order cancelled',
  },
  statusFlow: [
    'pending',
    'order_placed',
    'vendor_accepted',
    'payment_done',
    'order_confirmed',
    'truck_loading',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered',
  ],
};

// Payment Types
export const PAYMENT_TYPES = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  upi: 'UPI Payment',
  wallet: 'Digital Wallet',
  net_banking: 'Net Banking',
  bank_transfer: 'Bank Transfer (RTGS/NEFT/Cheque/DD)',
  cash_on_delivery: 'Cash on Delivery',
};

// Payment Modes
export const PAYMENT_MODES = {
  online: 'Online Payment',
  offline: 'Offline Payment',
  cash_on_delivery: 'Cash on Delivery',
};

// Units
export const UNITS = {
  BAG: 'Bag',
  TON: 'Ton',
  KG: 'Kilogram',
  CUBIC_METER: 'Cubic Meter',
  PIECE: 'Piece',
  UNIT: 'Unit',
  SET: 'Set',
};

// Product Filtering Configuration
export const PRODUCT_FILTERING = {
  byCategory: {
    description: 'Filter products by category',
    categories: ['Cement', 'Iron', 'Steel', 'Concrete Mixer'],
    example: 'GET /api/inventory/pricing?category=Cement&pincode=508001',
  },
  bySubCategory: {
    description: 'Filter products by subcategory within a category',
    example: 'GET /api/inventory/pricing?category=Cement&subCategory=OPC&pincode=508001',
  },
  byPriceRange: {
    description: 'Filter products by price range',
    example: 'GET /api/inventory/pricing?minPrice=100&maxPrice=500&pincode=508001',
  },
  bySearch: {
    description: 'Search products by name/description',
    example: 'GET /api/inventory/pricing?search=cement&pincode=508001',
  },
  byVendor: {
    description: 'Filter products by vendor',
    example: 'GET /api/inventory/pricing?vendor=Nagarjuna Cement&pincode=508001',
  },
  combinedFilters: {
    description: 'Combine multiple filters',
    example: 'GET /api/inventory/pricing?category=Cement&subCategory=OPC&minPrice=100&maxPrice=300&search=nagarjuna&pincode=508001&page=1&limit=20',
  },
};

// Product Data Structure
export const PRODUCT_DATA_STRUCTURE = {
  essentialFields: [
    '_id',
    'itemDescription',
    'category',
    'subCategory',
    'primaryImage',
    'pricing.unitPrice',
    'pricing.basePrice',
    'warehouse.isDeliveryAvailable',
    'warehouse.distance',
    'totalPrice',
  ],
  optionalFields: [
    'images',
    'vendor',
    'grade',
    'specification',
    'details',
    'warehouse.stock',
    'warehouse.deliveryConfig',
  ],
  displayFields: {
    productName: 'itemDescription',
    currentPrice: 'pricing.unitPrice',
    originalPrice: 'pricing.basePrice',
    discount: 'Calculate: ((basePrice - unitPrice) / basePrice) * 100',
    deliveryCharge: 'Calculate: totalPrice - unitPrice',
    isFreeDelivery: 'deliveryCharge === 0',
    deliveryAvailable: 'warehouse.isDeliveryAvailable',
    distance: 'warehouse.distance (km)',
    warehouseName: 'warehouse.warehouseName',
  },
};

// Pagination Configuration
export const PAGINATION = {
  defaultPageSize: 50,
  maxPageSize: 100,
  paginationObject: {
    currentPage: 'number',
    totalPages: 'number',
    totalItems: 'number',
    hasNext: 'boolean',
    hasPrev: 'boolean',
    limit: 'number',
  },
};

// Image Handling Configuration
export const IMAGE_HANDLING = {
  imageUrls: {
    type: 'S3 URLs',
    format: 'Full HTTPS URLs',
    example: 'https://infraxpert-inventory-images.s3.ap-south-1.amazonaws.com/inventory/1762066213814-e3fea9f665cf05a792ae1b34b331df0a-C007.png',
    note: 'Images are hosted on AWS S3, handle loading states and errors gracefully',
  },
  primaryImage: {
    field: 'primaryImage',
    fallback: 'Use first image from images array or placeholder',
  },
  imageArray: {
    field: 'images',
    note: 'Array of image objects, check isPrimary flag for main image',
  },
};

// Best Practices Configuration
export const BEST_PRACTICES = {
  caching: 'Cache category list and product listings with appropriate TTL',
  pagination: 'Implement infinite scroll or pagination for better UX',
  searchDebouncing: 'Debounce search queries by 300-500ms',
  imageLoading: 'Lazy load product images, show placeholders while loading',
  pincodeValidation: 'Validate pincode format client-side before API call',
  errorStates: 'Show appropriate error states for network failures and empty results',
  filtering: 'Combine filters on client side when possible to reduce API calls',
  deliveryCalculation: 'Always pass pincode for accurate delivery charges calculation',
};

// Product Card Design Configuration
export const PRODUCT_CARD_DESIGN = {
  cardStructure: {
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      shadow: 'Elevation/Layer 2',
      hoverShadow: 'Elevation/Layer 4',
      overflow: 'hidden',
      transition: '300ms ease-in-out',
      padding: 0,
    },
    layout: {
      type: 'Vertical Stack',
      sections: ['Image Section (top)', 'Content Section (bottom)'],
    },
  },
  imageSection: {
    height: {
      mobile: 128,
      tablet: 144,
      desktop: 160,
    },
    aspectRatio: '16:9',
    backgroundColor: '#F3F4F6',
    image: {
      source: 'product.primaryImage or product.images[0].url',
      fallback: 'placeholder-image.jpg',
      fit: 'cover',
      position: 'center',
      hoverEffect: 'scale(1.1) with 300ms transition',
    },
    overlays: {
      discountBadge: {
        position: 'absolute top-left',
        top: 8,
        left: 8,
        backgroundColor: '#10B981',
        textColor: '#FFFFFF',
        fontSize: 12,
        padding: '4px 8px',
        borderRadius: 9999,
        fontWeight: 'medium',
        condition: 'Show only if product.discount > 0 AND product.basePrice > product.currentPrice',
        text: '{product.discount}% OFF',
        zIndex: 10,
      },
      wishlistIcon: {
        position: 'absolute top-right',
        top: 8,
        right: 8,
        container: {
          width: { mobile: 24, tablet: 28, desktop: 32 },
          height: { mobile: 24, tablet: 28, desktop: 32 },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        icon: {
          type: 'Heart icon',
          color: '#374151',
          size: { mobile: 12, tablet: 14, desktop: 16 },
        },
        zIndex: 10,
      },
    },
  },
  contentSection: {
    padding: {
      mobile: 12,
      tablet: 16,
      desktop: 20,
    },
  },
  gridLayout: {
    container: {
      mobile: 1,
      tablet: 2,
      desktop: 2,
      largeDesktop: 3,
    },
    gap: {
      mobile: 12,
      tablet: 16,
      desktop: 24,
    },
  },
  colors: {
    primary: '#1D4ED8',
    primaryHover: '#6D28D9',
    secondary: '#2563EB',
    success: '#10B981',
    successLight: '#059669',
    error: '#DC2626',
    warning: '#FACC15',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    background: '#FFFFFF',
    backgroundLight: '#F9FAFB',
    border: '#E5E7EB',
  },
  typography: {
    productName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    label: {
      fontSize: 12,
      fontWeight: 'normal',
      color: '#6B7280',
    },
    value: {
      fontSize: 12,
      fontWeight: 'normal',
      color: '#4B5563',
    },
    price: {
      fontSize: { small: 12, large: 14 },
      fontWeight: { normal: 'semibold', total: 'bold' },
    },
    badge: {
      fontSize: 12,
      fontWeight: 'medium',
    },
  },
  spacing: {
    cardPadding: {
      mobile: 12,
      tablet: 16,
      desktop: 20,
    },
    sectionSpacing: {
      small: 4,
      medium: 8,
      large: 12,
    },
    elementSpacing: {
      xsmall: 2,
      small: 4,
      medium: 8,
    },
  },
  dataMapping: {
    productName: 'item.itemDescription',
    brand: 'item.vendor.name',
    image: 'item.primaryImage or item.images[0].url',
    currentPrice: 'item.pricing.unitPrice',
    basePrice: 'item.pricing.basePrice',
    totalPrice: 'item.totalPrice',
    deliveryCharge: 'Calculate: item.totalPrice - item.pricing.unitPrice',
    isDeliveryAvailable: 'item.isDeliveryAvailable',
    deliveryReason: 'item.deliveryReason',
    distance: 'item.distance',
    warehouseName: 'item.warehouseName',
    formattedItemCode: 'item.formattedItemCode',
    subCategory: 'item.subCategory',
    discount: 'Calculate: ((basePrice - unitPrice) / basePrice) * 100',
    rating: 4.5,
    reviews: 'Random 100-1000',
    features: '[item.grade, item.specification, item.details].filter(not null)',
    inStock: 'item.warehouse.stock.available > 0',
  },
};

// Error Handling Configuration
export const ERROR_HANDLING = {
  400: {
    message: 'Bad Request - Invalid parameters',
    action: 'Check request parameters and format',
  },
  401: {
    message: 'Unauthorized - Token expired or invalid',
    action: 'Refresh token or redirect to login',
  },
  403: {
    message: 'Forbidden - Insufficient permissions',
    action: 'Show error message to user',
  },
  404: {
    message: 'Resource not found',
    action: 'Show appropriate error message',
  },
  500: {
    message: 'Server error',
    action: 'Retry or show error message',
  },
  503: {
    message: 'Service Unavailable - Server maintenance',
    action: 'Show maintenance message to user',
  },
  productSpecific: {
    noPincode: 'If pincode not provided, delivery charges may not be calculated',
    invalidPincode: 'If pincode invalid, products will still load but delivery info may be missing',
    noDeliveryAvailable: 'check isDeliveryAvailable flag, deliveryReason contains reason if false',
  },
};

/**
 * Helper function to build URL with path parameters
 * @param {string} url - URL template with {param} placeholders
 * @param {Object} params - Parameters to replace in URL
 * @returns {string} - Built URL
 */
export const buildUrl = (url, params = {}) => {
  let builtUrl = url;
  Object.keys(params).forEach((key) => {
    builtUrl = builtUrl.replace(`{${key}}`, params[key]);
  });
  return builtUrl;
};

/**
 * Helper function to get endpoint configuration
 * @param {string} category - Endpoint category (auth, inventory, orders, etc.)
 * @param {string} endpoint - Endpoint name
 * @returns {Object} - Endpoint configuration
 */
export const getEndpoint = (category, endpoint) => {
  return API_ENDPOINTS[category]?.[endpoint] || null;
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.defaultHeaders,
});

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('🌐 NETWORK REQUEST:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      timestamp: new Date().toISOString()
    });
    
    return config;
  },
  (error) => {
    console.log('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ NETWORK RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response;
  },
  async (error) => {
    // Log error response
    console.log('❌ NETWORK ERROR:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });

    const originalRequest = error.config;
    const isRefreshTokenRequest = originalRequest?.url?.includes('/api/auth/refresh-token');

    // If this is a refresh token request that failed, don't try to refresh again
    if (isRefreshTokenRequest) {
      console.log('🛑 Refresh token request failed, clearing tokens and stopping retry');
      await clearTokens();
      processQueue(error);
      // Navigate to login screen
      setTimeout(() => {
        navigateToLogin();
      }, 100);
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshTokenValue = await getRefreshToken();
        if (refreshTokenValue) {
          const refreshResult = await refreshToken(refreshTokenValue);
          
          if (refreshResult.success) {
            // Store new tokens
            // Preserve existing userData if refresh response doesn't include it
            const existingUserData = await getUserData();
            const userDataToStore = refreshResult.data.user || existingUserData || {};
            
            await storeTokens(
              refreshResult.data.accessToken,
              refreshResult.data.refreshToken,
              userDataToStore
            );

            // Process queued requests
            processQueue(null, refreshResult.data.accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResult.data.accessToken}`;
            isRefreshing = false;
            return apiClient(originalRequest);
          } else {
            // Refresh failed
            console.log('🛑 Token refresh failed, clearing tokens');
            await clearTokens();
            processQueue(error);
            isRefreshing = false;
            // Navigate to login screen
            setTimeout(() => {
              navigateToLogin();
            }, 100);
            return Promise.reject(error);
          }
        } else {
          // No refresh token available
          console.log('🛑 No refresh token available, clearing tokens');
          await clearTokens();
          processQueue(error);
          isRefreshing = false;
          // Navigate to login screen
          setTimeout(() => {
            navigateToLogin();
          }, 100);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and stop retrying
        console.log('🛑 Token refresh error, clearing tokens:', refreshError);
        await clearTokens();
        processQueue(error);
        isRefreshing = false;
        // Navigate to login screen
        setTimeout(() => {
          navigateToLogin();
        }, 100);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
