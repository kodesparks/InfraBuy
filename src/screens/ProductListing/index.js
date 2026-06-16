import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, RefreshControl, Dimensions, Modal, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { typography, spacing, borderRadius, shadows } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import PincodeModal from '../../components/common/PincodeModal';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';
import { inventoryService, mapInventoryItemToProduct } from '../../services/api/inventoryService';
import createProductListingStyles from '../../assets/styles/productListing';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import Skeleton from '../../components/common/Skeleton';
import CartFloatingPill from '../../components/common/CartFloatingPill';

const { width: screenWidth } = Dimensions.get('window');

// Category name mapping: Homepage category names -> API category names
const CATEGORY_NAME_MAPPING = {
  'Cement': 'Cement',
  'Steel': 'Iron', // API uses "Iron" not "Steel"
  'Concrete Mix': 'Concrete Mixer', // API uses "Concrete Mixer" not "Concrete Mix"
  'Mixer': 'Concrete Mixer', // Alternative name
  'Iron': 'Iron',
  'Concrete Mixer': 'Concrete Mixer',
  'Others': 'Concrete Mixer', // Map Others homepage category to Concrete Mixer in DB
};

// Helper function to get API category name from homepage category name
const getApiCategoryName = (homepageCategoryName) => {
  if (!homepageCategoryName) return null;
  const normalized = homepageCategoryName.trim();
  return CATEGORY_NAME_MAPPING[normalized] || normalized;
};

const ProductListing = ({ navigation, route }) => {
  const category = route.params?.category || { name: 'Products' };
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createAllStyles(colors, isDarkMode), [colors, isDarkMode]);

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [sortBy, setSortBy] = useState('none'); // 'none', 'low-to-high', 'high-to-low'
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pagination, setPagination] = useState(null);

  const { t } = useTranslation();

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
  const filteredProducts = products.filter(product => {
    // Filter by category with name mapping
    if (category.name && category.name !== 'All' && category.name !== 'Products') {
      const productCategory = (product.category || '').trim();
      const apiCategoryName = getApiCategoryName(category.name);
      const selectedCategory = (apiCategoryName || category.name).trim();

      if (productCategory.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // Filter by subcategory if selected
    if (selectedSubCategory && selectedSubCategory !== 'All') {
      const productSubCategory = (product.subCategory || '').trim();
      const selectedSub = selectedSubCategory.trim();

      if (selectedSub === 'Others') {
        const subCatLower = productSubCategory.toLowerCase();
        if (subCatLower === 'opc' || subCatLower === 'ppc') {
          return false;
        }
        return productSubCategory.length > 0;
      }

      if (productSubCategory.toLowerCase() !== selectedSub.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'none') return 0;

    const getPrice = (product) => {
      if (userPincode && product.totalPrice) {
        return product.totalPrice;
      }
      return product.currentPrice || product.basePrice || 0;
    };

    const priceA = getPrice(a);
    const priceB = getPrice(b);

    if (sortBy === 'low-to-high') {
      return priceA - priceB;
    } else if (sortBy === 'high-to-low') {
      return priceB - priceA;
    }

    return 0;
  });

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const renderProductCard = (product) => {
    const cardBorderColors = ['#7C3AED', '#2563EB']; // Violet to Blue
    const buttonGradientColors = isDarkMode ? ['#4F46E5', '#3B82F6'] : ['#6366F1', '#3B82F6'];

    return (
      <View key={product.id || product._id} style={styles.productShadowWrapper}>
        <LinearGradient
          colors={cardBorderColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 1.5, borderRadius: 16, flex: 1 }} // Thickened and forced to fill
        >
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleProductPress(product)}
            activeOpacity={0.9}
          >
            {/* Image Section */}
            <View style={styles.productImageContainer}>
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Icon name="image" size={24} color={isDarkMode ? "#4B5563" : "#9CA3AF"} />
                </View>
              )}
            </View>

            {/* Content Section */}
            <View style={styles.productInfo}>
              <View>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name || product.itemDescription}
                </Text>
                
                <Text style={styles.priceLabel}>
                  {t('Price on request')}
                </Text>
              </View>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                  Toast.show({
                    type: 'success',
                    text1: t('Added to Enquiry'),
                    text2: `${product.name || product.itemDescription} ${t('added successfully')}`,
                  });
                }}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={buttonGradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.enquiryButton}
                >
                  <Text style={styles.enquiryButtonText}>{t('Enquiry')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const renderOthersProductCard = (product) => {
    const cardBorderColors = ['#7C3AED', '#2563EB']; // Violet to Blue
    const buttonGradientColors = isDarkMode ? ['#4F46E5', '#3B82F6'] : ['#6366F1', '#3B82F6'];

    return (
      <View key={product.id || product._id} style={styles.othersProductShadowWrapper}>
        <LinearGradient
          colors={cardBorderColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.othersProductBorderGradient}
        >
          <TouchableOpacity
            style={styles.othersProductCard}
            onPress={() => handleProductPress(product)}
            activeOpacity={0.9}
          >
            {/* Left Content Column */}
            <View style={styles.othersProductInfo}>
              <Text style={styles.othersProductName} numberOfLines={2}>
                {product.name || product.itemDescription}
              </Text>
              
              <Text style={styles.othersPriceLabel}>
                {t('Price on request')}
              </Text>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                  Toast.show({
                    type: 'success',
                    text1: t('Added to Enquiry'),
                    text2: `${product.name || product.itemDescription} ${t('added successfully')}`,
                  });
                }}
                style={{ alignSelf: 'flex-start' }}
              >
                <LinearGradient
                  colors={buttonGradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.othersEnquiryButton}
                >
                  <Text style={styles.othersEnquiryButtonText}>{t('Enquiry')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Right Image Column */}
            <View style={styles.othersProductImageContainer}>
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  style={styles.othersProductImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Icon name="image" size={32} color={isDarkMode ? "#4B5563" : "#9CA3AF"} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const renderDeliveryLocation = () => {
    return (
      <View style={styles.deliveryLocationSection}>
        <View style={styles.deliveryLocationHeader}>
          <View style={styles.deliveryLocationIcon}>
            <Icon name="map-pin" size={16} color="#723FED" />
          </View>
          <View style={styles.deliveryLocationInfo}>
            <Text style={styles.deliveryLocationTitle}>{t('Delivery Location')}</Text>
            <Text style={styles.deliveryLocationPincode}>{userPincode || t('Not set')}</Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePincode}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.changeButtonGradient}
            >
              <Text style={styles.changeButtonText}>{t('Change')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getSubCategories = () => {
    const categoryName = (category.name || '').toLowerCase();
    if (categoryName.includes('cement')) {
      return ['All', 'OPC', 'PPC', 'Others'];
    }
    let uniqueSubs = [...new Set(products.map(p => p.subCategory).filter(Boolean))];
    if (categoryName.includes('steel')) {
      return ['All', '8mm', '5mm'];
    } else if (categoryName.includes('concrete mix') || categoryName.includes('concretemix') || categoryName.includes('concrete mixer') || categoryName.includes('mixer') || categoryName.includes('others')) {
      const removeSet = new Set(['opc', 'ppc', 'tmt bars', 'psc']);
      uniqueSubs = uniqueSubs.filter(sub => !removeSet.has(sub.toLowerCase()));
    }
    return ['All', ...uniqueSubs];
  };

  const subCategories = getSubCategories();

  const renderOthersSkeleton = () => {
    const skeletonItems = [1, 2, 3, 4];
    return (
      <View style={{ width: '100%' }}>
        {skeletonItems.map((item) => (
          <View key={item} style={styles.othersProductCardWrapper}>
            <View style={[styles.othersProductCard, { overflow: 'hidden', borderWidth: 1.5, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              {/* Left Column content */}
              <View style={styles.othersProductInfo}>
                <Skeleton width="90%" height={24} borderRadius={4} style={{ marginBottom: 12 }} />
                <Skeleton width="60%" height={18} borderRadius={4} style={{ marginBottom: 16 }} />
                <Skeleton width={120} height={36} borderRadius={18} />
              </View>
              {/* Right Column content */}
              <View style={styles.othersProductImageContainer}>
                <Skeleton width={110} height={110} borderRadius={12} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSkeleton = () => {
    const skeletonItems = [1, 2, 3, 4, 5, 6];
    return (
      <View style={styles.skeletonContainer}>
        {skeletonItems.map((item) => (
          <View key={item} style={styles.productCardWrapper}>
            <View style={styles.skeletonCard}>
              <Skeleton height={160} borderRadius={16} />
              <View style={{ padding: spacing.md }}>
                <Skeleton width="80%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={16} borderRadius={4} style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height={44} borderRadius={30} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {category.name === 'Others' ? renderOthersSkeleton() : renderSkeleton()}
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={48} color="#DC2626" />
      <Text style={styles.errorTitle}>{t('Unable to Load Products')}</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>{t('Retry')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="package" size={60} color="#9CA3AF" />
      <Text style={styles.emptyText}>{t('No products found')}</Text>
      <Text style={styles.emptySubtext}>
        {t("We couldn't find any products in this category. \nTry selecting a different category or check back later.")}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>{t('Refresh')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterButton = (items, selectedItem, onSelect, title) => {
    if (!items || items.length === 0 || items.length === 1) return null;

    return (
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>{title}</Text>
          <TouchableOpacity 
            style={styles.filterIconButton}
            onPress={() => setShowSortDropdown(true)}
          >
            <Icon name="sliders" size={18} color="#723FED" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtonsContainer}
        >
          {items.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.filterButton}
              onPress={() => onSelect(item)}
            >
              {selectedItem === item ? (
                <LinearGradient
                  colors={colors.primaryGradient}
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
        <FlatList
          key={category.name === 'Others' ? 'list-single-column' : 'list-three-columns'}
          data={sortedProducts}
          keyExtractor={(item, index) => item.id || item._id || index.toString()}
          renderItem={({ item }) => (
            <View style={category.name === 'Others' ? styles.othersProductCardWrapper : styles.productCardWrapper}>
              {category.name === 'Others' ? renderOthersProductCard(item) : renderProductCard(item)}
            </View>
          )}
          numColumns={category.name === 'Others' ? 1 : 3}
          columnWrapperStyle={category.name === 'Others' ? undefined : styles.columnWrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.topActionsHeaderContainer}>
                <TouchableOpacity 
                  style={styles.filterIconButtonHeader}
                  onPress={() => setShowSortDropdown(true)}
                >
                  <Icon name="sliders" size={20} color="#723FED" />
                </TouchableOpacity>
              </View>
              {loading && renderLoadingState()}
              {!loading && error && renderErrorState()}
              {!loading && !error && sortedProducts.length === 0 && renderEmptyState()}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchProducts}
              tintColor="#723FED"
            />
          }
        />
      </View>

      <PincodeModal
        visible={showPincodeModal}
        onClose={() => setShowPincodeModal(false)}
        onPincodeSet={(pincodeData) => {
          handlePincodeSet(pincodeData);
          setShowPincodeModal(false);
        }}
      />



      <Modal
        visible={showSortDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>{t('Sort')}</Text>
            {[
              { value: 'none', label: t('Default') },
              { value: 'low-to-high', label: t('Low to High') },
              { value: 'high-to-low', label: t('High to Low') }
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  sortBy === option.value && styles.dropdownOptionSelected
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  sortBy === option.value && styles.dropdownOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Icon name="check" size={20} color="#723FED" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <CustomerCareFooter />
      <CartFloatingPill navigation={navigation} />
    </>
  );
};

const createAllStyles = (colors, isDarkMode) => {
  const baseStyles = createProductListingStyles(colors, isDarkMode);
  return StyleSheet.create({
    ...baseStyles,
    content: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
  scrollContent: {
    paddingTop: spacing.xxl + 60,
    paddingBottom: 250, 
  },
  filterSection: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  filterIconButton: {
    padding: spacing.xs,
    backgroundColor: isDarkMode ? colors.surface_container_high : '#F0EEFF',
    borderRadius: 8,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? colors.surface_container_low : '#FFFFFF',
    marginRight: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterButtonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#723FED',
  },
  filterButtonTextActive: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  columnWrapper: {
    justifyContent: 'flex-start', // Use flex-start for tighter grid
    paddingHorizontal: 8,
  },
  productCardWrapper: {
    // Width is handled in baseStyles/productShadowWrapper
  },
  othersProductCardWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    width: '100%',
  },
  othersProductShadowWrapper: {
    borderRadius: 16,
    backgroundColor: colors.background,
    ...shadows.cloud,
    overflow: 'visible',
  },
  othersProductBorderGradient: {
    padding: 1.5,
    borderRadius: 16,
  },
  othersProductCard: {
    height: 146,
    borderRadius: 15,
    backgroundColor: isDarkMode ? '#111318' : '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  othersProductInfo: {
    flex: 1.2,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  othersProductName: {
    fontSize: 20,
    fontWeight: '800',
    color: isDarkMode ? '#E5E7EB' : '#1F2937',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  othersPriceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: isDarkMode ? '#9CA3AF' : '#4B5563',
    marginBottom: 12,
  },
  othersEnquiryButton: {
    width: 120,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  othersEnquiryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  othersProductImageContainer: {
    flex: 0.8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  othersProductImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '80%',
    maxWidth: 300,
    ...shadows.cloud,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  dropdownOptionSelected: {
    backgroundColor: isDarkMode ? colors.surface_container : '#E8E5FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  topActionsHeaderContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
    marginTop: 10,
  },
  filterIconButtonHeader: {
    padding: 12,
    backgroundColor: isDarkMode ? colors.surface_container_high : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#723FED30',
    ...shadows.cloud,
    elevation: 4,
  },
  filterTextLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#723FED',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  skeletonCard: {
    backgroundColor: isDarkMode ? '#111113' : '#FFFFFF',
    borderRadius: 15, // Slightly smaller than wrapper to prevent gradient clipping
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    width: (screenWidth - 32) / 3, // Match the card width logic
    marginBottom: 12,
  },
  });
};

export default ProductListing;
