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
  const [expandedSections, setExpandedSections] = useState({
    details: false,
    specifications: false,
    deliveryInfo: false
  });

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => Math.min(prev + 0.5, 10));
      setSelectedQuantity(prev => Math.min(prev + 0.5, 10));
    } else if (type === 'decrease') {
      setQuantity(prev => Math.max(prev - 0.5, 0.5));
      setSelectedQuantity(prev => Math.max(prev - 0.5, 0.5));
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const renderDetailsContent = () => (
    <View style={styles.expandableContent}>
      <Text style={styles.expandableContentText}>
        • High-quality TATA TISCON 550SD steel rods{'\n'}
        • Superior tensile strength and durability{'\n'}
        • Corrosion-resistant properties{'\n'}
        • Ideal for construction and infrastructure projects{'\n'}
        • Meets all industry standards and specifications{'\n'}
        • Available in various sizes and lengths{'\n'}
        • Premium grade material for long-lasting performance
      </Text>
    </View>
  );

  const renderSpecificationsContent = () => (
    <View style={styles.expandableContent}>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>Grade:</Text>
        <Text style={styles.specValue}>550SD</Text>
      </View>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>Diameter:</Text>
        <Text style={styles.specValue}>8mm - 32mm</Text>
      </View>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>Length:</Text>
        <Text style={styles.specValue}>6m, 12m</Text>
      </View>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>Tensile Strength:</Text>
        <Text style={styles.specValue}>550 N/mm²</Text>
      </View>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>Yield Strength:</Text>
        <Text style={styles.specValue}>500 N/mm²</Text>
      </View>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>Elongation:</Text>
        <Text style={styles.specValue}>≥ 12%</Text>
      </View>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>Weight:</Text>
        <Text style={styles.specValue}>0.395 kg/m (8mm)</Text>
      </View>
    </View>
  );

  const renderDeliveryInfoContent = () => (
    <View style={styles.expandableContent}>
      <View style={styles.deliveryItem}>
        <Text style={styles.deliveryIcon}>🚚</Text>
        <View style={styles.deliveryTextContainer}>
          <Text style={styles.deliveryTitle}>Free Delivery</Text>
          <Text style={styles.deliverySubtitle}>On orders above ₹10,000</Text>
        </View>
      </View>
      <View style={styles.deliveryItem}>
        <Text style={styles.deliveryIcon}>⏰</Text>
        <View style={styles.deliveryTextContainer}>
          <Text style={styles.deliveryTitle}>Same Day Delivery</Text>
          <Text style={styles.deliverySubtitle}>For orders placed before 2 PM</Text>
        </View>
      </View>
      <View style={styles.deliveryItem}>
        <Text style={styles.deliveryIcon}>📍</Text>
        <View style={styles.deliveryTextContainer}>
          <Text style={styles.deliveryTitle}>Delivery Areas</Text>
          <Text style={styles.deliverySubtitle}>Mumbai, Pune, Nagpur, Aurangabad</Text>
        </View>
      </View>
      <View style={styles.deliveryItem}>
        <Text style={styles.deliveryIcon}>📞</Text>
        <View style={styles.deliveryTextContainer}>
          <Text style={styles.deliveryTitle}>Track Order</Text>
          <Text style={styles.deliverySubtitle}>Call: +91 98765 43210</Text>
        </View>
      </View>
    </View>
  );

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
            {/* Details Section */}
            <TouchableOpacity 
              style={styles.expandableItem}
              onPress={() => toggleSection('details')}
            >
              <Text style={styles.expandableText}>Details</Text>
              <Text style={[
                styles.expandableArrow,
                expandedSections.details && styles.expandableArrowRotated
              ]}>
                {expandedSections.details ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {expandedSections.details && renderDetailsContent()}
            
            {/* Specifications Section */}
            <TouchableOpacity 
              style={styles.expandableItem}
              onPress={() => toggleSection('specifications')}
            >
              <Text style={styles.expandableText}>Specifications</Text>
              <Text style={[
                styles.expandableArrow,
                expandedSections.specifications && styles.expandableArrowRotated
              ]}>
                {expandedSections.specifications ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {expandedSections.specifications && renderSpecificationsContent()}
            
            {/* Delivery Info Section */}
            <TouchableOpacity 
              style={styles.expandableItem}
              onPress={() => toggleSection('deliveryInfo')}
            >
              <Text style={styles.expandableText}>Delivery Info</Text>
              <Text style={[
                styles.expandableArrow,
                expandedSections.deliveryInfo && styles.expandableArrowRotated
              ]}>
                {expandedSections.deliveryInfo ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {expandedSections.deliveryInfo && renderDeliveryInfoContent()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetail; 