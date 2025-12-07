import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { colors, typography, spacing, borderRadius } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import PincodeModal from '../../components/common/PincodeModal';
import AddToCartSuccessModal from '../../components/common/AddToCartSuccessModal';
import { inventoryService, mapInventoryItemToProduct } from '../../services/api/inventoryService';
import productListingStyles from '../../assets/styles/productListing';

const { width: screenWidth } = Dimensions.get('window');

// Category name mapping: Homepage category names -> API category names
const CATEGORY_NAME_MAPPING = {
  'Cement': 'Cement',
  'Steel': 'Iron', // API uses "Iron" not "Steel"
  'Concrete Mix': 'Concrete Mixer', // API uses "Concrete Mixer" not "Concrete Mix"
  'Mixer': 'Concrete Mixer', // Alternative name
  'Iron': 'Iron',
  'Concrete Mixer': 'Concrete Mixer',
};

// Helper function to get API category name from homepage category name
const getApiCategoryName = (homepageCategoryName) => {
  if (!homepageCategoryName) return null;
  const normalized = homepageCategoryName.trim();
  return CATEGORY_NAME_MAPPING[normalized] || normalized;
};

const ProductListing = ({ navigation, route }) => {
  const { category } = route.params || { name: 'Products' };
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [favorites, setFavorites] = useState(new Set());
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  
  // Get delivery info and cart functions from context
  const { 
    userPincode, 
    getDeliveryInfoForCategory, 
    handlePincodeSet,
    addToCart,
  } = useAppContext();

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, [category.name, userPincode, selectedSubCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Client-side filtering: Fetch ALL products (no category/subcategory in API call)
      const params = {
        page: 1,
        limit: 100, // Reasonable limit for API (max might be 100)
      };

      // Pincode might be required by API - try with pincode if available
      // If no pincode, API might still work but with limited functionality
      if (userPincode) {
        params.pincode = userPincode;
      }

      // Don't send category or subcategory to API - we filter on frontend
      const result = await inventoryService.getInventoryWithPricing(params);

      if (result.success && result.data) {
        // Map API items to product format
        const mappedProducts = result.data.inventory.map(mapInventoryItemToProduct);
        setProducts(mappedProducts);
        setPagination(result.data.pagination);
      } else {
        // Show detailed error message
        const errorMsg = result.error || 'Unable to load products. Please try again.';
        console.error('API Error:', errorMsg);
        setError(errorMsg);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Check if it's a validation error (400)
      if (err.response?.status === 400) {
        const errorData = err.response?.data;
        let errorMsg = 'Validation error. ';
        
        if (errorData?.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map(detail => {
            if (typeof detail === 'string') return detail;
            if (detail.message) return detail.message;
            if (detail.msg) return detail.msg;
            return JSON.stringify(detail);
          }).join(', ');
          
          errorMsg += validationErrors;
        } else if (errorData?.error) {
          errorMsg += errorData.error;
        } else {
          errorMsg += 'Please check your input and try again.';
        }
        
        setError(errorMsg);
      } else {
        setError('Network error. Please check your internet connection.');
      }
      
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePincode = () => {
    setShowPincodeModal(true);
  };

  const handleRetry = () => {
    fetchProducts();
  };

  // Client-side filtering: Filter products by category and subcategory
  // Category names from API: "Cement", "Iron", "Concrete Mixer"
  // Homepage sends: "Cement", "Steel", "Concrete Mix"
  // Uses category name mapping to match homepage names to API names
  const filteredProducts = products.filter(product => {
    // Filter by category with name mapping
    if (category.name && category.name !== 'All' && category.name !== 'Products') {
      const productCategory = (product.category || '').trim();
      // Map homepage category name to API category name
      const apiCategoryName = getApiCategoryName(category.name);
      const selectedCategory = (apiCategoryName || category.name).trim();
      
      // Case-insensitive comparison for better matching
      if (productCategory.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // Filter by subcategory if selected
    if (selectedSubCategory && selectedSubCategory !== 'All') {
      const productSubCategory = (product.subCategory || '').trim();
      const selectedSub = selectedSubCategory.trim();
      
      // Special handling for "Others" - show products that are not OPC or PPC
      if (selectedSub === 'Others') {
        const subCatLower = productSubCategory.toLowerCase();
        if (subCatLower === 'opc' || subCatLower === 'ppc') {
          return false;
        }
        // Show products that have a subcategory but it's not OPC or PPC
        return productSubCategory.length > 0;
      }
      
      // Case-insensitive comparison for OPC, PPC, etc.
      if (productSubCategory.toLowerCase() !== selectedSub.toLowerCase()) {
        return false;
      }
    }
    
    return true;
  });

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const renderProductCard = (product) => {
    const discount = product.discount || 0;
    const hasDiscount = discount > 0 && product.basePrice > product.currentPrice;
    
    return (
      <TouchableOpacity
        key={product.id || product._id}
        style={styles.productCard}
        onPress={() => handleProductPress(product)}
        activeOpacity={0.8}
      >
        {/* Image Section */}
        <View style={styles.productImageContainer}>
          {product.image ? (
            <Image 
              source={{ uri: product.image }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="image" size={40} color="#9CA3AF" />
            </View>
          )}
          
          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
            </View>
          )}
          
          {/* Favorite/Wishlist Icon */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id || product._id);
            }}
          >
            <Icon 
              name={favorites.has(product.id || product._id) ? "heart" : "heart"} 
              size={12} 
              color={favorites.has(product.id || product._id) ? "#DC2626" : "#374151"} 
            />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.productInfo}>
          {/* Brand Badge */}
          {product.brand && (
            <View style={styles.brandBadgeContainer}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>{product.brand}</Text>
              </View>
            </View>
          )}

          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>
            {product.name || product.itemDescription}
          </Text>

          {/* Item Code and Subcategory Row */}
          <View style={styles.itemCodeRow}>
            {product.formattedItemCode && (
              <Text style={styles.itemCode}>{product.formattedItemCode}</Text>
            )}
            {product.subCategory && (
              <View style={styles.subCategoryBadge}>
                <Text style={styles.subCategoryBadgeText}>{product.subCategory}</Text>
              </View>
            )}
          </View>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <View style={styles.featuresContainer}>
              {product.features.slice(0, 2).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Icon name="check" size={10} color="#10B981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            {userPincode ? (
              // With Pincode - Show detailed pricing
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base Price:</Text>
                  <View style={styles.priceValueContainer}>
                    {hasDiscount && (
                      <Text style={styles.originalPrice}>
                        ₹{product.basePrice.toLocaleString()}
                      </Text>
                    )}
                    <Text style={styles.discountedPrice}>
                      ₹{product.currentPrice.toLocaleString()}/{product.units}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.deliveryRow}>
                  <Text style={styles.priceLabel}>Delivery:</Text>
                  {!product.isDeliveryAvailable ? (
                    <Text style={styles.deliveryNotAvailable}>Not Available</Text>
                  ) : product.isFreeDelivery ? (
                    <Text style={styles.deliveryFree}>FREE</Text>
                  ) : (
                    <Text style={styles.deliveryCharge}>
                      ₹{product.deliveryCharge.toLocaleString()}
                    </Text>
                  )}
                </View>

                <View style={styles.totalPriceRow}>
                  <Text style={styles.totalPriceLabel}>Total:</Text>
                  <Text style={styles.totalPriceValue}>
                    ₹{product.totalPrice.toLocaleString()}/{product.units}
                  </Text>
                </View>

                {product.distance > 0 && (
                  <View style={styles.distanceInfo}>
                    <Text style={styles.distanceText}>
                      📍 {product.distance}km from {product.warehouseName}
                    </Text>
                    {!product.isDeliveryAvailable && product.deliveryReason && (
                      <Text style={styles.deliveryReason}>{product.deliveryReason}</Text>
                    )}
                  </View>
                )}
              </>
            ) : (
              // Without Pincode - Show simple pricing
              <>
                <View style={styles.priceRow}>
                  {hasDiscount ? (
                    <>
                      <Text style={styles.originalPrice}>
                        ₹{product.basePrice.toLocaleString()}
                      </Text>
                      <Text style={styles.discountedPrice}>
                        ₹{product.currentPrice.toLocaleString()}/{product.units}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.currentPrice}>
                      ₹{product.currentPrice.toLocaleString()}/{product.units}
                    </Text>
                  )}
                </View>
                {hasDiscount && (
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                )}
                <Text style={styles.deliveryNote}>+ Delivery charges</Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !product.isDeliveryAvailable && styles.addToCartButtonDisabled
              ]}
              disabled={!product.isDeliveryAvailable}
              onPress={async (e) => {
                e.stopPropagation();
                if (!userPincode) {
                  Toast.show({
                    type: 'error',
                    text1: 'Pincode Required',
                    text2: 'Please set your delivery pincode to add items to cart.',
                  });
                  return;
                }
                
                // Add to cart - show modal on success, toast only on error
                try {
                  const result = await addToCart(product, 1);
                  console.log('Add to cart result:', result);
                  
                  // Always show modal if success is true OR if there's no error (treat as success)
                  // Only show toast if there's an explicit error
                  if (result.success === true || (!result.error && result.message)) {
                    // Set product data and show modal (NO TOAST)
                    setAddedProduct(product);
                    setShowAddToCartModal(true);
                    console.log('Showing add to cart modal');
                  } else if (result.error) {
                    // Only show toast for actual errors
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: result.error || 'Failed to add product to cart',
                    });
                  } else {
                    // Default: treat as success and show modal
                    setAddedProduct(product);
                    setShowAddToCartModal(true);
                    console.log('Showing add to cart modal (default success)');
                  }
                } catch (error) {
                  console.error('Error in add to cart:', error);
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to add product to cart. Please try again.',
                  });
                }
              }}
            >
              <Text style={[
                styles.addToCartButtonText,
                !product.isDeliveryAvailable && styles.addToCartButtonTextDisabled
              ]}>
                {product.isDeliveryAvailable ? 'Add to Cart' : 'Delivery Not Available'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={(e) => {
                e.stopPropagation();
                handleProductPress(product);
              }}
            >
              <Icon name="eye" size={14} color="#1D4ED8" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDeliveryLocation = () => {
    const deliveryInfo = getDeliveryInfoForCategory(category.name);
    
    return (
      <View style={styles.deliveryLocationSection}>
        <View style={styles.deliveryLocationHeader}>
          <View style={styles.deliveryLocationIcon}>
            <Icon name="map-pin" size={16} color="#723FED" />
          </View>
          <View style={styles.deliveryLocationInfo}>
            <Text style={styles.deliveryLocationTitle}>Delivery Location</Text>
            <Text style={styles.deliveryLocationPincode}>{userPincode || 'Not set'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={handleChangePincode}
          >
            <LinearGradient
              colors={['#723FED', '#3B58EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.changeButtonGradient}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Get subcategories for filter - simplified for Cement: only OPC, PPC, Others
  const getSubCategories = () => {
    if (category.name === 'Cement' || category.name === 'Cement') {
      // For Cement, only show OPC, PPC, and Others
      const cementSubCategories = ['All', 'OPC', 'PPC', 'Others'];
      return cementSubCategories;
    }
    // For other categories, show all unique subcategories
    return ['All', ...new Set(products.map(p => p.subCategory).filter(Boolean))];
  };
  const subCategories = getSubCategories();

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#723FED" />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={48} color="#DC2626" />
      <Text style={styles.errorTitle}>Unable to Load Products</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="package" size={60} color="#9CA3AF" />
      <Text style={styles.emptyText}>No products found</Text>
      <Text style={styles.emptySubtext}>
        We couldn't find any products in this category.
        {'\n'}Try selecting a different category or check back later.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterButton = (items, selectedItem, onSelect, title) => {
    if (!items || items.length === 0 || items.length === 1) return null;
    
    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>{title}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtonsContainer}
        >
          {items.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.filterButton}
              onPress={() => {
                onSelect(item);
                // Filter change will trigger useEffect to fetch new products
              }}
            >
              {selectedItem === item ? (
                <LinearGradient
                  colors={['#723FED', '#3B58EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filterButtonGradient}
                >
                  <Text style={styles.filterButtonTextActive}>{item}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterButtonText}>{item}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchProducts}
              tintColor="#723FED"
            />
          }
        >
          {/* Delivery Location Section */}
          {renderDeliveryLocation()}

          {/* Filters */}
          {!loading && !error && subCategories.length > 1 && (
            renderFilterButton(subCategories, selectedSubCategory, setSelectedSubCategory, 'Subcategory')
          )}

          {/* Loading State */}
          {loading && renderLoadingState()}

          {/* Error State */}
          {!loading && error && renderErrorState()}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && renderEmptyState()}

          {/* Products Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <View style={styles.productsContainer}>
              <View style={styles.productsGrid}>
                {filteredProducts.map(renderProductCard)}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Pincode Modal */}
      <PincodeModal
        visible={showPincodeModal}
        onClose={() => setShowPincodeModal(false)}
        onPincodeSet={(pincodeData) => {
          handlePincodeSet(pincodeData);
          setShowPincodeModal(false);
        }}
      />

      {/* Add to Cart Success Modal */}
      <AddToCartSuccessModal
        visible={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        onContinueShopping={() => setShowAddToCartModal(false)}
        onViewCart={() => {
          setShowAddToCartModal(false);
          navigation.navigate('Cart');
        }}
        productName={addedProduct?.name || addedProduct?.itemDescription || 'Product'}
        quantity={1}
        unit={addedProduct?.units || addedProduct?.unit || 'PIECE'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  ...productListingStyles,
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  deliveryLocationSection: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLocationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  deliveryLocationInfo: {
    flex: 1,
  },
  deliveryLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  deliveryLocationPincode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  deliveryTimeText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  changeButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  changeButtonGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterSection: {
    marginVertical: spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#723FED',
    backgroundColor: '#E8E5FF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    minWidth: 80,
  },
  filterButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#723FED',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: colors.textWhite,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'stretch',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#723FED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  placeholderImage: {
    width: '100%',
    height: 128,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
    marginTop: 4,
  },
  deliveryNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
});

export default ProductListing; 