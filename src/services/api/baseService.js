import { apiClient } from './config';

/**
 * Create a new resource
 */
export const createResource = async (endpoint, data) => {
  try {
    // Log the request
    console.log('🚀 API REQUEST:', {
      method: 'POST',
      url: `${apiClient.defaults.baseURL}${endpoint}`,
      data: data,
      timestamp: new Date().toISOString()
    });

    const response = await apiClient.post(endpoint, data);
    
    // Log the response
    console.log('✅ API RESPONSE:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Operation completed successfully'
    };
  } catch (error) {
    // Log the error
    console.log('❌ API ERROR:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });

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
