// API Configuration and Client
export { 
  apiClient, 
  API_CONFIG,
  API_ENDPOINTS,
  ORDER_STATUS,
  PAYMENT_TYPES,
  PAYMENT_MODES,
  UNITS,
  ERROR_HANDLING,
  PRODUCT_FILTERING,
  PRODUCT_DATA_STRUCTURE,
  PAGINATION,
  IMAGE_HANDLING,
  BEST_PRACTICES,
  PRODUCT_CARD_DESIGN,
  buildUrl,
  getEndpoint
} from './config';

// Base Service Functions
export { createResource, handleError } from './baseService';

// Signup Service
export { registerUser } from './signupService';

// Login Service
export { loginUser, refreshToken, logoutUser } from './loginService';

// Inventory Service
export { inventoryService, mapInventoryItemToProduct } from './inventoryService';

// Cart Service
export { cartService } from './cartService';

// Order Service
export { orderService } from './orderService';
