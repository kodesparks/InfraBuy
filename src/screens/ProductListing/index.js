import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../assets/styles/global';

const ProductListing = ({ navigation, route }) => {
  const { category } = route.params || { name: 'Products' };
  const [selectedCementType, setSelectedCementType] = useState('OPC');
  const [selectedGrade, setSelectedGrade] = useState('53G');

  const cementTypes = ['OPC', 'PPC'];
  const grades = ['43G', '53G', '53GS'];

  const products = [
    {
      id: 1,
      name: 'UltraTech Cement',
      type: 'OPC',
      grade: '53G',
      price: 420,
      unit: 'per 50kg bag',
      image: require('../../assets/images/cement.png'),
      inStock: true,
    },
    {
      id: 2,
      name: 'ACC Cement',
      type: 'PPC',
      grade: '53G',
      price: 395,
      unit: 'per 50kg bag',
      image: require('../../assets/images/cement.png'),
      inStock: true,
    },
    {
      id: 3,
      name: 'Ambuja Cement',
      type: 'OPC',
      grade: '43G',
      price: 380,
      unit: 'per 50kg bag',
      image: require('../../assets/images/cement.png'),
      inStock: true,
    },
    {
      id: 4,
      name: 'JSW Cement',
      type: 'PPC',
      grade: '53GS',
      price: 410,
      unit: 'per 50kg bag',
      image: require('../../assets/images/cement.png'),
      inStock: false,
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesType = selectedCementType === 'All' || product.type === selectedCementType;
    const matchesGrade = selectedGrade === 'All' || product.grade === selectedGrade;
    return matchesType && matchesGrade;
  });

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const renderProductCard = (product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productImageContainer}>
        <Image source={product.image} style={styles.productImage} />
        {product.inStock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>In Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productType}>{product.type} {product.grade}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₹{product.price}</Text>
          <Text style={styles.productUnit}>{product.unit}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (items, selectedItem, onSelect, title) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.filterButtons}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              selectedItem === item && styles.filterButtonTextActive,
            ]}
            onPress={() => onSelect(item)}
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
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filters */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderFilterButton(cementTypes, selectedCementType, setSelectedCementType, 'Cement Type')}
        {renderFilterButton(grades, selectedGrade, setSelectedGrade, 'Grade')}

        {/* Products */}
        <View style={styles.productsContainer}>
          <View style={styles.productsGrid}>
            {filteredProducts.map(renderProductCard)}
          </View>
        </View>
      </ScrollView>
    </View>
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
  filterSection: {
    marginVertical: spacing.md,
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
    paddingVertical: spacing.xs,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: colors.textWhite,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 0,
  },
  productsContainer: {
    // paddingBottom: 80, // Extra padding for bottom navigation bar
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  productCard: {
    backgroundColor: colors.card,
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