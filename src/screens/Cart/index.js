import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import styles from '../../assets/styles/cart';
import OrderConfirmation from '../../components/OrderConfirmation';
import { colors } from '../../assets/styles/global';

const Cart = ({ navigation }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Maha HD+ Cement (Bags)',
      price: '₹ 340/bag',
      quantity: 5,
      image: '🏗️'
    },
    {
      id: 2,
      name: 'TATA TISCON 550SD (Tons)',
      price: '₹ 8.500/ton',
      quantity: 1,
      image: '🏗️'
    }
  ]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const updateQuantity = (itemId, change) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handlePlaceOrder = () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Error', 'Please enter your shipping address');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleContinueShopping = () => {
    setShowConfirmation(false);
    navigation.navigate('MainApp');
  };

  const total = calculateTotal();

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
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.cartCard}>
          <Text style={styles.cartTitle}>Cart Items</Text>
          
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemImageContainer}>
                <Text style={styles.itemImage}>{item.image}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₹ {total.toLocaleString()}</Text>
          </View>

          {/* Shipping Address */}
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Shipping Address</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your shipping address"
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.darkGray}
            />
          </View>

          {/* Customer Care */}
          <View style={styles.customerCareContainer}>
            <Text style={styles.customerCareIcon}>📞</Text>
            <Text style={styles.customerCareText}>Customer Care: +91 98765 43210</Text>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderText}>PLACE ORDER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Order Confirmation Modal */}
      <OrderConfirmation
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onContinueShopping={handleContinueShopping}
      />
    </SafeAreaView>
  );
};

export default Cart; 