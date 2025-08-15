import BaseService from './baseService';

/**
 * Product Service - Extends BaseService for product-specific operations
 * Demonstrates how different modules can use the same base CRUD operations
 */
class ProductService extends BaseService {
  constructor() {
    super('/products'); // API endpoint for products
  }

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Additional parameters (pagination, sorting, etc.)
   * @returns {Promise<Object>} Products in category
   */
  async getProductsByCategory(categoryId, params = {}) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/category/${categoryId}`,
        params
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getProductsByCategory');
    }
  }

  /**
   * Get products by brand
   * @param {string} brandId - Brand ID
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Products by brand
   */
  async getProductsByBrand(brandId, params = {}) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/brand/${brandId}`,
        params
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getProductsByBrand');
    }
  }

  /**
   * Search products with advanced filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(searchParams) {
    return this.search(searchParams);
  }

  /**
   * Get product variants
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product variants
   */
  async getProductVariants(productId) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/${productId}/variants`
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getProductVariants');
    }
  }

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @param {Object} params - Pagination parameters
   * @returns {Promise<Object>} Product reviews
   */
  async getProductReviews(productId, params = {}) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/${productId}/reviews`,
        params
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getProductReviews');
    }
  }

  /**
   * Add product review
   * @param {string} productId - Product ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Review creation result
   */
  async addProductReview(productId, reviewData) {
    try {
      const response = await this.customRequest({
        method: 'POST',
        url: `${this.endpoint}/${productId}/reviews`,
        data: reviewData
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'addProductReview');
    }
  }

  /**
   * Upload product images
   * @param {string} productId - Product ID
   * @param {FormData} formData - Form data containing images
   * @returns {Promise<Object>} Upload result
   */
  async uploadProductImages(productId, formData) {
    try {
      const response = await this.customRequest({
        method: 'POST',
        url: `${this.endpoint}/${productId}/images`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'uploadProductImages');
    }
  }

  /**
   * Get product inventory
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product inventory
   */
  async getProductInventory(productId) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/${productId}/inventory`
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getProductInventory');
    }
  }

  /**
   * Update product inventory
   * @param {string} productId - Product ID
   * @param {Object} inventoryData - Inventory data
   * @returns {Promise<Object>} Inventory update result
   */
  async updateProductInventory(productId, inventoryData) {
    try {
      const response = await this.customRequest({
        method: 'PUT',
        url: `${this.endpoint}/${productId}/inventory`,
        data: inventoryData
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'updateProductInventory');
    }
  }

  /**
   * Get related products
   * @param {string} productId - Product ID
   * @param {number} limit - Number of related products to return
   * @returns {Promise<Object>} Related products
   */
  async getRelatedProducts(productId, limit = 10) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/${productId}/related`,
        params: { limit }
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getRelatedProducts');
    }
  }

  /**
   * Get featured products
   * @param {Object} params - Parameters (limit, category, etc.)
   * @returns {Promise<Object>} Featured products
   */
  async getFeaturedProducts(params = {}) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/featured`,
        params
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getFeaturedProducts');
    }
  }

  /**
   * Get trending products
   * @param {Object} params - Parameters (limit, period, etc.)
   * @returns {Promise<Object>} Trending products
   */
  async getTrendingProducts(params = {}) {
    try {
      const response = await this.customRequest({
        method: 'GET',
        url: `${this.endpoint}/trending`,
        params
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'getTrendingProducts');
    }
  }

  /**
   * Bulk update products
   * @param {Array<Object>} products - Array of products to update
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateProducts(products) {
    try {
      const response = await this.customRequest({
        method: 'PUT',
        url: `${this.endpoint}/bulk-update`,
        data: { products }
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'bulkUpdateProducts');
    }
  }

  /**
   * Import products from CSV
   * @param {FormData} formData - Form data containing CSV file
   * @returns {Promise<Object>} Import result
   */
  async importProducts(formData) {
    try {
      const response = await this.customRequest({
        method: 'POST',
        url: `${this.endpoint}/import`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'importProducts');
    }
  }

  /**
   * Export products to CSV
   * @param {Object} filters - Export filters
   * @returns {Promise<Object>} Export result
   */
  async exportProducts(filters = {}) {
    try {
      const response = await this.customRequest({
        method: 'POST',
        url: `${this.endpoint}/export`,
        data: filters,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      return this.handleError(error, 'exportProducts');
    }
  }
}

// Create and export a singleton instance
const productService = new ProductService();
export default productService;
