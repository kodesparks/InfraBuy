import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';

const ProductDetail = ({ navigation, route }) => {
  const { product } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [specificationsExpanded, setSpecificationsExpanded] = useState(false);
  const [deliveryExpanded, setDeliveryExpanded] = useState(true);

  const productData = product || {
    name: 'ACC Cement',
    type: 'OPC',
    grade: '53 Grade',
    price: 395,
    unit: 'per 50kg bag',
    image: require('../../assets/images/cement.png'),
    inStock: true,
    brand: 'ACC Limited',
    weight: '50 kg per bag',
    manufacturer: 'ACC Limited, India'
  };

  // Ensure productData has valid values
  useEffect(() => {
    // Component initialized successfully
  }, [product, productData, quantity]);

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    navigation.navigate('Cart');
  };

  // Safety check function to ensure price is always a valid number
  const getValidPrice = () => {
    const price = productData?.price;
    
    // If price is already a number and valid
    if (typeof price === 'number' && !isNaN(price)) {
      return price;
    }
    
    // If price is a string, try to extract the numeric value
    if (typeof price === 'string') {
      const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
      if (!isNaN(numericPrice)) {
        return numericPrice;
      }
    }
    
    // Default fallback
    return 0;
  };

  // Helper function to format price display
  const formatPrice = (price) => {
    const validPrice = getValidPrice();
    return validPrice.toLocaleString();
  };

  const renderProductImage = () => (
    <View style={styles.productImageContainer}>
      <Image source={productData.image} style={styles.productImage} />
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfoContainer}>
      <Text style={styles.productName}>{productData.name}</Text>
      <View style={styles.gradeBadge}>
        <Text style={styles.gradeText}>{productData.type} {productData.grade}</Text>
      </View>
    </View>
  );

  const renderPricingCard = () => {
    // Calculate total amount inside the render function
    const currentPrice = getValidPrice();
    const currentTotal = currentPrice * quantity;
    
    return (
      <View style={styles.pricingCard}>
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{formatPrice()}</Text>
            <Text style={styles.priceUnit}>{productData.unit}</Text>
          </View>
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>In Stock</Text>
          </View>
        </View>
        
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Number of Bags</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Icon name="minus" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity 
              style={[styles.quantityButton, styles.quantityButtonActive]}
              onPress={() => handleQuantityChange(1)}
            >
              <Icon name="plus" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.totalSection}>
            <Text style={styles.totalAmount}>
              ₹{isNaN(currentTotal) ? '0' : currentTotal.toLocaleString()}
            </Text>
            <Text style={styles.totalLabel}>Total Amount</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderExpandableSection = (title, isExpanded, onToggle, children) => (
    <View style={styles.expandableSection}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
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

  const renderDetailsSection = () => (
    renderExpandableSection(
      'Details',
      detailsExpanded,
      () => setDetailsExpanded(!detailsExpanded),
      <View style={styles.detailsList}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Brand:</Text>
          <Text style={styles.detailValue}>{productData.brand}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>Ordinary Portland Cement</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Grade:</Text>
          <Text style={styles.detailValue}>{productData.grade}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Weight:</Text>
          <Text style={styles.detailValue}>{productData.weight}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Manufactured by:</Text>
          <Text style={styles.detailValue}>{productData.manufacturer}</Text>
        </View>
      </View>
    )
  );

  const renderSpecificationsSection = () => (
    renderExpandableSection(
      'Specifications',
      specificationsExpanded,
      () => setSpecificationsExpanded(!specificationsExpanded),
      <View style={styles.specificationsList}>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Compressive Strength:</Text>
          <Text style={styles.specValue}>53 MPa at 28 days</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Setting Time:</Text>
          <Text style={styles.specValue}>Initial: 30 min, Final: 600 min</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Fineness:</Text>
          <Text style={styles.specValue}>225 m²/kg minimum</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Soundness:</Text>
          <Text style={styles.specValue}>10 mm maximum</Text>
        </View>
      </View>
    )
  );

  const renderDeliverySection = () => (
    renderExpandableSection(
      'Delivery Information',
      deliveryExpanded,
      () => setDeliveryExpanded(!deliveryExpanded),
      <View style={styles.deliveryList}>
        <View style={styles.deliveryItem}>
          <View style={styles.deliveryIconContainer}>
            <Icon name="truck" size={20} color="#3B82F6" />
          </View>
          <View style={styles.deliveryContent}>
            <Text style={styles.deliveryTitle}>Standard Delivery</Text>
            <Text style={styles.deliveryDescription}>2-3 business days • Free for orders above ₹5000</Text>
          </View>
        </View>
        
        <View style={styles.deliveryItem}>
          <View style={styles.deliveryIconContainer}>
            <Icon name="clock" size={20} color="#10B981" />
          </View>
          <View style={styles.deliveryContent}>
            <Text style={styles.deliveryTitle}>Express Delivery</Text>
            <Text style={styles.deliveryDescription}>Same day delivery available • ₹200 additional charges</Text>
          </View>
        </View>
        
        <View style={styles.deliveryItem}>
          <View style={styles.deliveryIconContainer}>
            <Icon name="map-pin" size={20} color="#F59E0B" />
          </View>
          <View style={styles.deliveryContent}>
            <Text style={styles.deliveryTitle}>Delivery Areas</Text>
            <Text style={styles.deliveryDescription}>Available in Mumbai, Delhi, Bangalore, Chennai, Kolkata</Text>
          </View>
        </View>
        
        <View style={styles.importantNote}>
          <Text style={styles.importantNoteText}>
            Important Note{'\n'}Please ensure someone is available to receive the delivery as cement bags require manual handling.
          </Text>
        </View>
      </View>
    )
  );

  const renderAddToCartButton = () => (
    <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.addToCartGradient}
      >
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

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
  
  productImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
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
  
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  priceUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  stockBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  stockText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quantityButtonActive: {
    backgroundColor: '#3B82F6',
  },
  
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
    minWidth: 30,
    textAlign: 'center',
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
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
  },
  
  addToCartGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  addToCartText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
});

export default ProductDetail; 