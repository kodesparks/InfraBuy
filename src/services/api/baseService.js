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

    // Determine user-friendly error message
    let errorMessage = 'Something went wrong';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors?.[0]?.msg) {
      errorMessage = error.response.data.errors[0].msg;
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'Server is not responding. Please try again later.';
    } else if (!error.response && error.message === 'Network Error') {
      errorMessage = 'Unable to connect to server. Check your internet connection.';
    } else if (!error.response) {
      errorMessage = 'Server is unreachable. Please try again later.';
    }

    return {
      success: false,
      error: {
        message: errorMessage,
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


