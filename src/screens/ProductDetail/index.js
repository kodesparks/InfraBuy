import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, FlatList, Alert, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import AddToCartSuccessModal from '../../components/common/AddToCartSuccessModal';

const ProductDetail = ({ navigation, route }) => {
  const { product } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [specificationsExpanded, setSpecificationsExpanded] = useState(false);
  const [deliveryExpanded, setDeliveryExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const flatListRef = useRef(null);
  
  // Get cart functions and user pincode from AppContext
  const { addToCart, userPincode } = useAppContext();

  // Use product data directly - pricing is already included from ProductListing API call
  const productData = product;

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
      Alert.alert('Error', 'Product information is not available. Please try again.');
      return;
    }

    if (!productData.isDeliveryAvailable) {
      Alert.alert('Delivery Not Available', productData.deliveryReason || 'This product is not available for delivery to your location.');
      return;
    }

    if (!userPincode) {
      Alert.alert('Pincode Required', 'Please set your delivery pincode to add items to cart.');
      return;
    }

    // Add to cart - show modal on success, alert only on error
    try {
      const result = await addToCart(productData, quantity);
      console.log('Add to cart result:', result);
      
      // Always show modal if success is true OR if there's no error (treat as success)
      // Only show alert if there's an explicit error
      if (result.success === true || (!result.error && result.message)) {
        // Show success modal (NO ALERT) - cart badge will update automatically via context
        setShowAddToCartModal(true);
        console.log('Showing add to cart modal');
      } else if (result.error) {
        // Only show alert for actual errors
        Alert.alert('Error', result.error || 'Failed to add item to cart. Please try again.');
      } else {
        // Default: treat as success and show modal
        setShowAddToCartModal(true);
        console.log('Showing add to cart modal (default success)');
      }
    } catch (error) {
      console.error('Error in add to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleContinueShopping = () => {
    setShowAddToCartModal(false);
    // Stay on current page
  };

  const handleViewCart = () => {
    setShowAddToCartModal(false);
    navigation.navigate('Cart');
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

  const renderProductImage = () => {
    const images = productImages.length > 0 ? productImages : [];
    
    if (images.length === 0) {
      return (
        <View style={styles.productImageContainer}>
          <View style={styles.placeholderImageContainer}>
            <Icon name="image" size={80} color="#9CA3AF" />
            <Text style={styles.placeholderText}>No image available</Text>
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
        {productData?.formattedItemCode && (
          <Text style={styles.itemCodeText}>Item Code: {productData.formattedItemCode}</Text>
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
    
    return (
      <View style={styles.pricingCard}>
        {/* Price Display */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <View style={styles.priceRow}>
                <Text style={styles.originalPriceLarge}>
                  ₹{basePrice.toLocaleString()}
                </Text>
                <Text style={styles.currentPriceLarge}>
                  ₹{currentPrice.toLocaleString()}
                </Text>
                {discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.currentPriceLarge}>
                ₹{currentPrice.toLocaleString()}
              </Text>
            )}
            <Text style={styles.priceUnit}>/{units}</Text>
          </View>
        </View>

        {/* Delivery Information - Only show if pincode is set */}
        {userPincode && (
          <View style={styles.deliveryInfoSection}>
            <View style={styles.deliveryInfoRow}>
              <Text style={styles.deliveryInfoLabel}>Base Price:</Text>
              <Text style={styles.deliveryInfoValue}>
                ₹{currentPrice.toLocaleString()}/{units}
              </Text>
            </View>
            <View style={styles.totalPriceRow}>
              <Text style={styles.totalPriceLabel}>Total:</Text>
              <Text style={styles.totalPriceValue}>
                ₹{totalPrice.toLocaleString()}/{units}
              </Text>
            </View>
          </View>
        )}
        
        {/* Quantity Selector */}
        <View style={styles.quantitySectionContainer}>
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
              >
                <LinearGradient
                  colors={['#723FED', '#3B58EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quantityButtonGradient}
                >
                  <Icon name="minus" size={20} color={colors.white} />
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
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <LinearGradient
                  colors={['#723FED', '#3B58EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quantityButtonGradient}
                >
                  <Icon name="plus" size={20} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.totalSection}>
            <Text style={styles.totalAmount}>
              ₹{grandTotal.toLocaleString()}
            </Text>
            <Text style={styles.totalLabel}>Total Amount</Text>
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
            <Icon 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
            />
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
        label: 'Brand',
        value: productData.vendor?.name || productData.brand || 'N/A'
      });
    }
    
    if (productData?.category) {
      details.push({
        label: 'Category',
        value: productData.category
      });
    }
    
    if (productData?.subCategory) {
      details.push({
        label: 'Subcategory',
        value: productData.subCategory
      });
    }
    
    if (productData?.grade) {
      details.push({
        label: 'Grade',
        value: productData.grade
      });
    }
    
    if (productData?.units) {
      details.push({
        label: 'Unit',
        value: productData.units
      });
    }
    
    if (productData?.vendor?.companyName) {
      details.push({
        label: 'Manufacturer',
        value: productData.vendor.companyName
      });
    }

    if (details.length === 0) return null;

    return renderExpandableSection(
      'Product Details',
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
      'Specifications',
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
      const deliveryConfig = warehouse?.deliveryConfig || {};
      
      // Check if there's any delivery information to show
      const hasWarehouseInfo = warehouse?.warehouseName;
      const hasDeliveryConfig = deliveryConfig?.baseDeliveryCharge !== undefined || 
                                deliveryConfig?.perKmCharge !== undefined ||
                                deliveryConfig?.freeDeliveryThreshold !== undefined;
      const hasDeliveryReason = !productData?.isDeliveryAvailable && productData?.deliveryReason;
      
      // Don't render section if there's no information to display
      if (!hasWarehouseInfo && !hasDeliveryConfig && !hasDeliveryReason) {
        return null;
      }
      
      return renderExpandableSection(
        'Delivery Information',
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
                <Text style={styles.deliveryTitle}>Warehouse</Text>
                <Text style={styles.deliveryDescription}>
                  {warehouse?.warehouseName || 'N/A'}
                </Text>
                {warehouse?.location?.address && (
                  <Text style={styles.deliveryDescription}>
                    {warehouse.location.address}
                  </Text>
                )}
              </View>
            </View>
          )}

          {hasDeliveryConfig && (
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIconContainer}>
                <Icon name="truck" size={20} color="#F59E0B" />
              </View>
              <View style={styles.deliveryContent}>
                <Text style={styles.deliveryTitle}>Delivery Charges</Text>
                <Text style={styles.deliveryDescription}>
                  {deliveryConfig?.baseDeliveryCharge !== undefined 
                    ? `Base: ₹${(deliveryConfig.baseDeliveryCharge || 0).toLocaleString()}`
                    : 'Contact for pricing'
                  }
                  {deliveryConfig?.perKmCharge ? ` • ₹${deliveryConfig.perKmCharge}/km` : ''}
                </Text>
                {deliveryConfig?.freeDeliveryThreshold ? (
                  <Text style={styles.deliveryDescription}>
                    Free delivery for orders above ₹{deliveryConfig.freeDeliveryThreshold.toLocaleString()}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {hasDeliveryReason && (
            <View style={styles.importantNote}>
              <Text style={styles.importantNoteText}>
                Delivery Not Available{'\n'}{productData.deliveryReason || 'Delivery is not available for this product.'}
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
    const isDisabled = !productData.isDeliveryAvailable;
    
    return (
      <TouchableOpacity 
        style={[
          styles.addToCartButton,
          isDisabled && styles.addToCartButtonDisabled
        ]} 
        onPress={handleAddToCart}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={isDisabled ? ['#D1D5DB', '#9CA3AF'] : ['#723FED', '#3B58EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addToCartGradient}
        >
          <Text style={styles.addToCartText}>
            {isDisabled ? 'Delivery Not Available' : 'Add to Cart'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (!productData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#DC2626" />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorMessage}>Unable to load product details.</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      {/* Add to Cart Success Modal */}
      <AddToCartSuccessModal
        visible={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        onContinueShopping={handleContinueShopping}
        onViewCart={handleViewCart}
        productName={productData?.name || productData?.itemDescription || 'Product'}
        quantity={quantity}
        unit={productData?.units || productData?.unit || 'PIECE'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  
  scrollContent: {
    paddingBottom: spacing.xxl, // Add padding to the bottom of the ScrollView content
  },

  productImageContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  imageSlide: {
    width: Dimensions.get('window').width - (spacing.md * 2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  productImage: {
    width: Dimensions.get('window').width - (spacing.md * 4),
    height: 300,
    resizeMode: 'contain',
  },

  placeholderImageContainer: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  imageCounter: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  imageCounterText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  dotsContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  activeDot: {
    backgroundColor: colors.white,
    width: 24,
  },
  
  productInfoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  gradeBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  gradeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  itemCodeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  pricingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  
  priceContainer: {
    flex: 1,
  },
  
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  originalPriceLarge: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },

  currentPriceLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  
  priceUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  discountBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  deliveryInfoSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },

  deliveryInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  deliveryInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  deliveryInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  deliveryFreeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },

  deliveryNotAvailableText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },

  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  totalPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  distanceText: {
    fontSize: 12,
    color: '#6B7280',
  },

  quantitySectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  quantitySection: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  quantityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quantityButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
    minWidth: 30,
    textAlign: 'center',
  },
  
  quantityInput: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
    minWidth: 50,
    textAlign: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  
  totalSection: {
    alignItems: 'flex-end',
  },
  
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  addToCartButton: {
    marginBottom: spacing.lg,
    borderRadius: 12, // Semi-rounded design like ProductListing
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
  },
  
  addToCartGradient: {
    paddingVertical: 16, // Same padding as ProductListing buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  addToCartText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  
  expandableSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  
  sectionContent: {
    padding: spacing.lg,
  },
  
  detailsList: {
    gap: spacing.md,
  },
  
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },

  detailDescription: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  detailDescriptionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  
  specificationsList: {
    gap: spacing.md,
  },
  
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  specLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  
  specValue: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },

  specificationText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  
  deliveryList: {
    gap: spacing.lg,
  },
  
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  
  deliveryContent: {
    flex: 1,
  },
  
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  deliveryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  importantNote: {
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  
  importantNoteText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.xl,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  retryButton: {
    backgroundColor: '#723FED',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetail; 