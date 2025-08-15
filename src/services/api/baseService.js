import { apiClient } from './config';

/**
 * Create a new resource
 */
export const createResource = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data);
    
    return {
      success: true,
      data: response.data,
      message: 'Operation completed successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Something went wrong',
        status: error.response?.status,
        details: error.response?.data
      }
    };
  }
};

/**
 * Handle API errors
 */
export const handleError = (error, operation) => {
  return {
    success: false,
    error: {
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status,
      operation
    }
  };
};
