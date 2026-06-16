import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, FlatList, Alert, TextInput } from 'react-native';
import Skeleton from '../../components/common/Skeleton';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { spacing, borderRadius, shadows } from '../../assets/styles/global';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';
import AppHeader from '../../components/common/AppHeader';
import { useTranslation } from 'react-i18next';

const ProductDetail = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const product = route.params?.product;
  const [quantity, setQuantity] = useState(1);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [specificationsExpanded, setSpecificationsExpanded] = useState(false);
  const [deliveryExpanded, setDeliveryExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const flatListRef = useRef(null);

  // Get cart functions and user pincode from AppContext
  const { addToCart, userPincode } = useAppContext();

  // Use product data directly - pricing is already included from ProductListing API call
  const productData = product || {};

  // Get product images from API response
  const productImages = productData.images && productData.images.length > 0
    ? productData.images.map(img => img.url || img)
    : productData.primaryImage
      ? [productData.primaryImage]
      : productData.image
        ? [productData.image]
        : [];

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleQuantityInputChange = (text) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '') {
      setQuantity(1);
      return;
    }
    const numValue = parseInt(numericValue, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setQuantity(numValue);
    }
  };

  const handleQuantityBlur = () => {
    // Ensure quantity is at least 1 when user finishes editing
    if (quantity < 1) {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (!productData || (!productData.id && !productData._id)) {
      Alert.alert(t('Error'), t('Product information is not available. Please try again.'));
      return;
    }

    if (!userPincode) {
      Alert.alert(t('Pincode Required'), t('Please set your delivery pincode to add items to cart.'));
      return;
    }

    // Add to cart - success handled by context/pill
    setIsAddingToCart(true);
    try {
      const result = await addToCart(productData, quantity);
      console.log('Add to cart result:', result);

      if (result.success === true || (!result.error && result.message)) {
        // Success: The pill will appear automatically
        console.log('Product added to cart successfully');
      } else if (result.error) {
        // Only show alert for actual errors
        Alert.alert(t('Error'), result.error || t('Failed to add item to cart. Please try again.'));
      }
    } catch (error) {
      console.error('Error in add to cart:', error);
      Alert.alert(t('Error'), t('Failed to add item to cart. Please try again.'));
    } finally {
      setIsAddingToCart(false);
    }
  };


  const handleImageScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const imageWidth = Dimensions.get('window').width - (spacing.md * 4);
    const index = Math.round(contentOffset / imageWidth);
    setCurrentImageIndex(index);
  };

  const goToImage = (index) => {
    const imageWidth = Dimensions.get('window').width - (spacing.md * 4);
    flatListRef.current?.scrollToOffset({
      offset: index * imageWidth,
      animated: true,
    });
    setCurrentImageIndex(index);
  };

  // Get current price from API data
  const getCurrentPrice = () => {
    return productData?.pricing?.unitPrice || productData?.currentPrice || productData?.price || 0;
  };

  // Get base price from API data
  const getBasePrice = () => {
    return productData?.pricing?.basePrice || productData?.basePrice || 0;
  };

  // Get total price (including delivery)
  const getTotalPrice = () => {
    if (userPincode && productData?.totalPrice) {
      return productData.totalPrice;
    }
    return getCurrentPrice();
  };

  // Get delivery charge
  const getDeliveryCharge = () => {
    if (userPincode && productData?.totalPrice && productData?.pricing?.unitPrice) {
      return productData.totalPrice - productData.pricing.unitPrice;
    }
    return 0;
  };

  // Calculate discount percentage
  const getDiscount = () => {
    const basePrice = getBasePrice();
    const currentPrice = getCurrentPrice();
    if (basePrice > currentPrice && basePrice > 0) {
      return Math.round(((basePrice - currentPrice) / basePrice) * 100);
    }
    return 0;
  };

  const getUnitForCategory = (categoryName) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('cement')) {
      return t('Load');
    }
    if (name.includes('concrete') || name.includes('mixer') || name.includes('others')) {
      return t('Units');
    }
    if (name.includes('steel') || name.includes('iron')) {
      return t('Tonnes');
    }
    return '';
  };

  const renderProductImage = () => {
    const images = productImages.length > 0 ? productImages : [];

    if (images.length === 0) {
      return (
        <View style={styles.productImageContainer}>
          <View style={styles.placeholderImageContainer}>
            <Icon name="image" size={80} color="#9CA3AF" />
            <Text style={styles.placeholderText}>{t('No image available')}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.productImageContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleImageScroll}
          scrollEventThrottle={16}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.imageSlide}>
              <Image
                source={{ uri: typeof item === 'string' ? item : item.url || item }}
                style={styles.productImage}
                resizeMode="contain"
              />
            </View>
          )}
        />

        {/* Image Counter - Only show if more than 1 image */}
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        )}

        {/* Navigation Dots - Only show if more than 1 image */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.activeDot
                ]}
                onPress={() => goToImage(index)}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderProductInfo = () => {
    const productName = productData?.itemDescription || productData?.name || 'Product';
    const subCategory = productData?.subCategory || productData?.type || '';
    const grade = productData?.grade || '';

    return (
      <View style={styles.productInfoContainer}>
        <Text style={styles.productName}>{productName}</Text>
        {(subCategory || grade) && (
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>
              {subCategory} {grade}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderPricingCard = () => {
    const currentPrice = getCurrentPrice();
    const basePrice = getBasePrice();
    const deliveryCharge = getDeliveryCharge();
    const totalPrice = getTotalPrice();
    const discount = getDiscount();
    const hasDiscount = discount > 0 && basePrice > currentPrice;
    const units = productData?.units || productData?.unit || 'PIECE';

    // Calculate totals
    const currentTotal = currentPrice * quantity;
    const deliveryTotal = deliveryCharge * quantity;
    const grandTotal = (totalPrice * quantity) || (currentTotal + deliveryTotal);

    const qtyBtnColors = ['#FF7043', '#1E40AF'];
    const qtyIconColor = '#FFFFFF';

    return (
      <View style={styles.pricingCard}>
        {/* Price hidden per handoff */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPriceLarge}>{t('Price on request')}</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySectionContainer}>
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>{t('Quantity')}</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
              >
                <LinearGradient
                  colors={qtyBtnColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quantityButtonGradient}
                >
                  <Icon name="minus" size={20} color={qtyIconColor} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={handleQuantityInputChange}
                onBlur={handleQuantityBlur}
                keyboardType="numeric"
                textAlign="center"
                selectTextOnFocus
              />
              
              <Text style={styles.unitText}>
                {getUnitForCategory(productData?.category)}
              </Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <LinearGradient
                  colors={qtyBtnColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quantityButtonGradient}
                >
                  <Icon name="plus" size={20} color={qtyIconColor} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderExpandableSection = (title, isExpanded, onToggle, children) => {
    // Safety check: ensure all required parameters are valid
    if (!title || typeof onToggle !== 'function') {
      console.warn('Invalid parameters for renderExpandableSection');
      return null;
    }

    try {
      return (
        <View style={styles.expandableSection}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => {
              try {
                onToggle();
              } catch (error) {
                console.error('Error in expandable section toggle:', error);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.deliveryIconContainer}>
              <Icon
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.primary}
              />
            </View>
          </TouchableOpacity>
          {isExpanded && (
            <View style={styles.sectionContent}>
              {children}
            </View>
          )}
        </View>
      );
    } catch (error) {
      console.error('Error rendering expandable section:', error);
      return null;
    }
  };

  const renderDetailsSection = () => {
    const details = [];

    if (productData?.vendor?.name || productData?.brand) {
      details.push({
        label: t('Brand'),
        value: productData.vendor?.name || productData.brand || t('N/A')
      });
    }

    if (productData?.category) {
      details.push({
        label: t('Category'),
        value: productData.category
      });
    }

    if (productData?.subCategory) {
      details.push({
        label: t('Subcategory'),
        value: productData.subCategory
      });
    }

    if (productData?.grade) {
      details.push({
        label: t('Grade'),
        value: productData.grade
      });
    }

    if (productData?.units) {
      details.push({
        label: t('Unit'),
        value: productData.units
      });
    }

    if (productData?.vendor?.companyName) {
      details.push({
        label: t('Manufacturer'),
        value: productData.vendor.companyName
      });
    }

    if (details.length === 0) return null;

    return renderExpandableSection(
      t('Product Details'),
      detailsExpanded,
      () => setDetailsExpanded(!detailsExpanded),
      <View style={styles.detailsList}>
        {details.map((detail, index) => (
          <View key={index} style={styles.detailItem}>
            <Text style={styles.detailLabel}>{detail.label}:</Text>
            <Text style={styles.detailValue}>{detail.value}</Text>
          </View>
        ))}
        {productData?.details && (
          <View style={styles.detailDescription}>
            <Text style={styles.detailDescriptionText}>{productData.details}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderSpecificationsSection = () => {
    if (!productData?.specification) return null;

    return renderExpandableSection(
      t('Specifications'),
      specificationsExpanded,
      () => setSpecificationsExpanded(!specificationsExpanded),
      <View style={styles.specificationsList}>
        <Text style={styles.specificationText}>{productData.specification}</Text>
      </View>
    );
  };

  const renderDeliverySection = () => {
    // Safety check: return null if warehouse data is not available
    if (!productData?.warehouse) return null;

    try {
      const warehouse = productData.warehouse || {};

      // Check if there's any delivery information to show
      const hasWarehouseInfo = warehouse?.warehouseName;
      const hasDeliveryReason = !productData?.isDeliveryAvailable && productData?.deliveryReason;

      // Don't render section if there's no information to display
      if (!hasWarehouseInfo && !hasDeliveryReason) {
        return null;
      }

      return renderExpandableSection(
        t('Delivery Information'),
        deliveryExpanded,
        () => {
          try {
            setDeliveryExpanded(!deliveryExpanded);
          } catch (error) {
            console.error('Error toggling delivery section:', error);
          }
        },
        <View style={styles.deliveryList}>
          {hasWarehouseInfo && (
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIconContainer}>
                <Icon name="map-pin" size={20} color="#3B82F6" />
              </View>
              <View style={styles.deliveryContent}>
                <Text style={styles.deliveryTitle}>{t('Warehouse')}</Text>
                <Text style={styles.deliveryDescription}>
                  {warehouse?.warehouseName || t('N/A')}
                </Text>
                {warehouse?.location?.address && (
                  <Text style={styles.deliveryDescription}>
                    {warehouse.location.address}
                  </Text>
                )}
              </View>
            </View>
          )}

          {hasDeliveryReason && (
            <View style={styles.importantNote}>
              <Text style={styles.importantNoteText}>
                {t('Delivery Not Available')}{'\n'}{productData.deliveryReason || t('Delivery is not available for this product.')}
              </Text>
            </View>
          )}
        </View>
      );
    } catch (error) {
      console.error('Error rendering delivery section:', error);
      // Return null on error to prevent crash
      return null;
    }
  };

  const renderAddToCartButton = () => {
    return (
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={handleAddToCart}
      >
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.addToCartGradient}
        >
          <Text style={styles.addToCartText}>
            {t('Enquiry')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderProductDetailSkeleton = () => (
    <View style={styles.scrollContent}>
      {/* Image Carousel Skeleton */}
      <View style={styles.productImageContainer}>
        <Skeleton width="100%" height={280} borderRadius={borderRadius.xxl} />
      </View>

      {/* Info Section Skeleton */}
      <View style={styles.productInfoContainer}>
        <Skeleton width="90%" height={34} borderRadius={4} style={{ marginBottom: 12 }} />
        <Skeleton width="40%" height={30} borderRadius={20} />
      </View>

      {/* Pricing Section Skeleton */}
      <View style={styles.pricingCard}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Skeleton width="70%" height={36} borderRadius={4} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Skeleton width="100%" height={64} borderRadius={32} />
        </View>
      </View>

      {/* Action Button Skeleton */}
      <Skeleton width="100%" height={64} borderRadius={borderRadius.xl} style={{ marginBottom: 32 }} />

      {/* Expandable Sections Skeletons */}
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.expandableSection, { height: 72, justifyContent: 'center', paddingHorizontal: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="50%" height={20} borderRadius={4} />
            <Skeleton width={20} height={20} borderRadius={10} />
          </View>
        </View>
      ))}
    </View>
  );

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          {renderProductDetailSkeleton()}
        </ScrollView>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#DC2626" />
        <Text style={styles.errorTitle}>{t('Product Not Found')}</Text>
        <Text style={styles.errorMessage}>{t('Unable to load product details.')}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>{t('Go Back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        navigation={navigation}
        title={productData?.itemDescription || t('Product Details')}
        showBack={true}
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderProductImage()}
        {renderProductInfo()}
        {renderPricingCard()}
        {renderAddToCartButton()}
        {renderDetailsSection()}
        {renderSpecificationsSection()}
        {renderDeliverySection()}
      </ScrollView>

      <CustomerCareFooter />
    </View>
  );
};

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 120, // Header clearance
    paddingHorizontal: spacing.md,
    paddingBottom: 150, // Footer/Tab clearance
  },

  productImageContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.cloud,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },

  imageSlide: {
    width: Dimensions.get('window').width - (spacing.md * 4),
    alignItems: 'center',
    justifyContent: 'center',
  },

  productImage: {
    width: Dimensions.get('window').width - (spacing.md * 6),
    height: 280,
    resizeMode: 'contain',
  },

  placeholderImageContainer: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: borderRadius.xl,
  },

  placeholderText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  imageCounter: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },

  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  activeDot: {
    backgroundColor: colors.primary,
    width: 16,
  },

  productInfoContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },

  productName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 34,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },

  gradeBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },

  gradeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  pricingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.cloud,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },

  priceSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  currentPriceLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  quantitySectionContainer: {
    width: '100%',
  },

  quantitySection: {
    alignItems: 'center',
    gap: spacing.md,
  },

  quantityLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    padding: 6,
    height: 64,
    width: 240,
    ...shadows.soft,
  },

  quantityButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  },

  quantityButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    padding: 0,
  },

  unitText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '700',
    marginRight: spacing.md,
  },

  addToCartButton: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.full,
    ...shadows.cloud,
    height: 56,
    width: 220,
    alignSelf: 'center',
  },

  addToCartGradient: {
    flex: 1,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },

  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  expandableSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  sectionContent: {
    padding: spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },

  detailsList: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },

  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },

  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  detailDescription: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: borderRadius.lg,
  },

  detailDescriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  specificationsList: {
    paddingTop: spacing.md,
  },

  specificationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  deliveryList: {
    paddingTop: spacing.md,
    gap: spacing.lg,
  },

  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  deliveryContent: {
    flex: 1,
  },

  deliveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  deliveryDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  importantNote: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },

  importantNoteText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductDetail;
