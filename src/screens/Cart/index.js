import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
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

  const deleteItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
          }
        }
      ]
    );
  };

  const clearCart = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is already empty.');
      return;
    }

    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setCartItems([]);
            Alert.alert('Cart Cleared', 'All items have been removed from your cart.');
          }
        }
      ]
    );
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }

    if (!shippingAddress.trim()) {
      Alert.alert('Error', 'Please enter your shipping address');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleContinueShopping = () => {
    setShowConfirmation(false);
    setCartItems([]); // Clear cart after successful order
    setShippingAddress(''); // Clear address
    navigation.navigate('MainApp');
  };

  const total = calculateTotal();

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cart Items */}
        <View style={styles.cartCard}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Cart Items ({cartItems.length})</Text>
            {cartItems.length > 0 && (
              <TouchableOpacity style={styles.clearCartButton} onPress={clearCart}>
                <Icon name="trash-2" size={16} color="white" />
                <Text style={styles.clearCartText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Icon name="shopping-cart" size={60} color={colors.darkGray} />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.continueShoppingButton}
              >
                <TouchableOpacity 
                  style={styles.continueShoppingButtonInner}
                  onPress={() => navigation.navigate('MainApp')}
                >
                  <Icon name="shopping-bag" size={20} color="white" />
                  <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemImageContainer}>
                  <Text style={styles.itemImage}>{item.image}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Icon name="minus" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Icon name="plus" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Icon name="trash-2" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Total */}
          {cartItems.length > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹ {total.toLocaleString()}</Text>
            </View>
          )}

          {/* Shipping Address */}
          {cartItems.length > 0 && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Shipping Address</Text>
              <TextInput
                style={styles.addressInput}
                placeholder="Enter your shipping address"
                value={shippingAddress}
                onChangeText={setShippingAddress}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {/* Place Order Button */}
          {cartItems.length > 0 && (
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.placeOrderButton}
            >
              <TouchableOpacity 
                style={styles.placeOrderButtonInner}
                onPress={handlePlaceOrder}
              >
                <Icon name="check-circle" size={20} color="white" />
                <Text style={styles.placeOrderText}>Place Order</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>
      </ScrollView>

      {/* Order Confirmation Modal */}
      <OrderConfirmation
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onContinueShopping={handleContinueShopping}
        orderDetails={{
          items: cartItems,
          total: total,
          address: shippingAddress
        }}
      />
    </View>
  );
};

export default Cart; 