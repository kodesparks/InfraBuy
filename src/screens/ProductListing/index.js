import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, borderRadius } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import PincodeModal from '../../components/common/PincodeModal';
import { getAllProducts, getFilterOptionsByCategory } from '../../data/productsData';

const ProductListing = ({ navigation, route }) => {
  const { category } = route.params || { name: 'Products' };
  
  // Get filter options and set default selections
  const filterOptions = getFilterOptionsByCategory(category.name);
  const [selectedCementType, setSelectedCementType] = useState(filterOptions.types[0] || 'All');
  const [selectedGrade, setSelectedGrade] = useState(filterOptions.grades[0] || 'All');
  const [favorites, setFavorites] = useState(new Set());
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  
  // Get delivery info from context
  const { 
    userPincode, 
    getDeliveryInfoForCategory, 
    handlePincodeSet,
    calculateProductPrice,
  } = useAppContext();

  const handleChangePincode = () => {
    setShowPincodeModal(true);
  };

  // Get products from data file
  const products = getAllProducts();

  const filteredProducts = products.filter(product => {
    // Filter by category first
    const matchesCategory = product.category === category.name;
    
    // Then filter by type and grade
    const matchesType = selectedCementType === 'All' || product.type === selectedCementType;
    const matchesGrade = selectedGrade === 'All' || product.grade === selectedGrade;
    
    return matchesCategory && matchesType && matchesGrade;
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

  const renderProductCard = (product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productImageContainer}>
        <Image source={product.image} style={styles.productImage} />
        {/* Favorite Heart Icon */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product.id)}
        >
          <Text style={[
            styles.favoriteIcon,
            favorites.has(product.id) && styles.favoriteIconActive
          ]}>
            {favorites.has(product.id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productType}>{product.type} {product.grade}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            ₹{calculateProductPrice(product.price, category.name)}
          </Text>
          <Text style={styles.productUnit}>{product.unit}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            {deliveryInfo && (
              <Text style={styles.deliveryTimeText}>{deliveryInfo.deliveryTime}</Text>
            )}
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

  const renderFilterButton = (items, selectedItem, onSelect, title) => (
    <View style={[
      styles.filterSection,
      title === 'Grade' && styles.filterSectionNoPadding
    ]}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.filterButtons }>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              { flex: 1 },
              title === 'Type' && styles.cementTypeButton,
              title === 'Grade' && styles.gradeButton,
            ]}
            onPress={() => onSelect(item)}
          >
            {selectedItem === item ? (
              <LinearGradient
                colors={['#723FED', '#3B58EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.filterButtonGradient,
                  title === 'Type' && styles.cementTypeGradient,
                  title === 'Grade' && styles.gradeGradient,
                ]}
              >
                <Text style={styles.filterButtonTextActive}>{item}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.filterButtonText}>{item}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        {/* Filters */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Delivery Location Section */}
        {renderDeliveryLocation()}
          
          {renderFilterButton(filterOptions.types, selectedCementType, setSelectedCementType, 'Type')}
          {renderFilterButton(filterOptions.grades, selectedGrade, setSelectedGrade, 'Grade')}

          {/* Products */}
          <View style={styles.productsContainer}>
            <View style={styles.productsGrid}>
              {filteredProducts.map(renderProductCard)}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Pincode Modal - Rendered outside the main container */}
      <PincodeModal
        visible={showPincodeModal}
        onClose={() => setShowPincodeModal(false)}
        onPincodeSet={(pincodeData) => {
          handlePincodeSet(pincodeData);
          setShowPincodeModal(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.lg, // Add padding to the bottom of the ScrollView content
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
  filterSectionNoPadding: {
    marginVertical: 0, // No padding for grade section
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    borderRadius: 12, // Semi-rounded design
    borderWidth: 1,
    borderColor: '#723FED', // Purple border for inactive state
    backgroundColor: '#E8E5FF', // Light purple filled background for inactive
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2, // Small gap between buttons
  },
  cementTypeButton: {
    paddingVertical: 12, // More padding for cement type buttons
  },
  gradeButton: {
    paddingVertical: 10, // Less padding for grade buttons
  },
  filterButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12, // Semi-rounded design
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0, // No border for gradient
  },
  cementTypeGradient: {
    paddingVertical: 12, // More padding for cement type gradient
  },
  gradeGradient: {
    paddingVertical: 10, // Less padding for grade gradient
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#723FED', // Purple text for inactive state (matches border)
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: colors.textWhite,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  productsContainer: {
    marginTop: spacing.lg, // Add gap between filter buttons and product cards
    paddingBottom: 100, // Extra padding for bottom navigation bar
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  productCard: {
    backgroundColor: '#E0E0E0', // Darker gray background for cards
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '48%',
    marginBottom: spacing.md,
    marginHorizontal: '1%',
  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  stockBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textWhite,
  },
  favoriteButton: {
    position: 'absolute',
    top: -10,
    right: -10, 
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  favoriteIconActive: {
    fontSize: 18,
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  productDetails: {
    marginBottom: spacing.sm,
  },
  productType: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  productUnit: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ProductListing; 