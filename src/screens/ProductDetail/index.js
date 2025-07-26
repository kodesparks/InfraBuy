import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import styles from '../../assets/styles/productDetail';

const ProductDetail = ({ navigation, route }) => {
  const { product } = route.params || {
    name: 'TATA TISCON 550SD Steel Rod',
    price: '₹ 8.500 / ton',
    image: '🏗️'
  };
  
  const [quantity, setQuantity] = useState(0.5);
  const [selectedQuantity, setSelectedQuantity] = useState(1.0);

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => Math.min(prev + 0.5, 10));
      setSelectedQuantity(prev => Math.min(prev + 0.5, 10));
    } else if (type === 'decrease') {
      setQuantity(prev => Math.max(prev - 0.5, 0.5));
      setSelectedQuantity(prev => Math.max(prev - 0.5, 0.5));
    }
  };

  const handleAddToOrder = () => {
    Alert.alert(
      'Add to Cart',
      `Added ${selectedQuantity}T of ${product.name} to cart`,
      [
        { text: 'Continue Shopping', onPress: () => navigation.navigate('MainApp') },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleCartPress}>
            <Text style={styles.headerIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Text style={styles.productImage}>{product.image}</Text>
        </View>

        {/* Product Info Card */}
        <View style={styles.productInfoCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
          
          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange('decrease')}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}T</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange('increase')}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedQuantity}>{selectedQuantity}T</Text>
          </View>

          {/* Add to Order Button */}
          <TouchableOpacity style={styles.addToOrderButton} onPress={handleAddToOrder}>
            <Text style={styles.addToOrderText}>Order Now</Text>
          </TouchableOpacity>

          {/* Expandable Sections */}
          <View style={styles.expandableSections}>
            <TouchableOpacity style={styles.expandableItem}>
              <Text style={styles.expandableText}>Details</Text>
              <Text style={styles.expandableArrow}>▶</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.expandableItem}>
              <Text style={styles.expandableText}>Specifications</Text>
              <Text style={styles.expandableArrow}>▶</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.expandableItem}>
              <Text style={styles.expandableText}>Delivery Info</Text>
              <Text style={styles.expandableArrow}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetail; 