import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import styles from '../../assets/styles/cart';
import OrderConfirmation from '../../components/OrderConfirmation';
import { colors } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import { useOrderContext } from '../../context/OrderContext';

const Cart = ({ navigation }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get cart data from AppContext
  const { 
    cartItems, 
    cartCount, 
    fetchCartItems,
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart: clearCartContext 
  } = useAppContext();

  // Fetch cart items on mount
  useEffect(() => {
    loadCartItems();
  }, []);

  // Reload cart items when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCartItems();
    }, [])
  );

  const loadCartItems = async () => {
    setLoading(true);
    const result = await fetchCartItems();
    setLoading(false);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to load cart items');
    }
  };

  // Get order management from OrderContext
  const { createOrder } = useOrderContext();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + ((item.currentPrice || 0) * (item.quantity || 1));
    }, 0);
  };

  const calculateDeliveryCharges = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.deliveryCharges || 0);
    }, 0);
  };

  const updateQuantity = async (leadId, itemCode, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    
    // If quantity becomes 0 or less, delete the item instead
    if (newQuantity <= 0) {
      deleteItem(leadId);
      return;
    }

    if (newQuantity === currentQuantity) return;

    setRefreshing(true);
    const result = await updateCartItemQuantity(leadId, itemCode, newQuantity);
    
    // Always refresh cart after update to show latest data and update badge
    // fetchCartItems() in AppContext will update cartCount automatically
    await loadCartItems();
    
    setRefreshing(false);

    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to update quantity');
    }
  };

  const deleteItem = async (leadId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setRefreshing(true);
            const result = await removeFromCart(leadId);
            // Refresh cart to update badge immediately
            await loadCartItems();
            setRefreshing(false);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to remove item');
            }
          }
        }
      ]
    );
  };

  const handleClearCart = () => {
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
          onPress: async () => {
            setRefreshing(true);
            const result = await clearCartContext();
            // Refresh cart to update badge immediately
            await loadCartItems();
            setRefreshing(false);
            if (result.success) {
              Alert.alert('Cart Cleared', result.message || 'All items have been removed from your cart.');
            } else {
              Alert.alert('Error', result.error || 'Failed to clear cart');
            }
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
    
    // Create order from cart items
    const totalAmount = calculateTotal();
    console.log('Creating order with cart items:', cartItems);
    console.log('Total amount:', totalAmount);
    
    const newOrder = createOrder(cartItems, '', totalAmount);
    console.log('Created order:', newOrder);
    
    Alert.alert(
      'Order Created Successfully!',
      `Order ID: ${newOrder.id}\nTotal Amount: ₹${totalAmount.toFixed(2)}\n\nPlease complete payment to proceed.`,
      [
        { 
          text: 'Complete Payment', 
          onPress: () => {
            clearCartContext();
            navigation.navigate('Orders');
          }
        },
        { text: 'Continue Shopping', style: 'cancel' }
      ]
    );
  };

  const handleContinueShopping = () => {
    setShowConfirmation(false);
    clearCartContext(); // Clear cart after successful order
    navigation.navigate('MainApp');
  };

  const total = calculateTotal();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#723FED" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadCartItems}
            colors={['#723FED']}
          />
        }
      >
        {/* Cart Items */}
        <View style={styles.cartCard}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Cart Items ({cartItems.length})</Text>
            {cartItems.length > 0 && (
              <TouchableOpacity style={styles.clearCartButton} onPress={handleClearCart}>
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
              <View key={item.id || item.leadId} style={styles.cartItem}>
                {/* Image Section */}
                <View style={styles.itemImageContainer}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.placeholderImageContainer}>
                      <Icon name="image" size={24} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                {/* Product Info and Actions Section */}
                <View style={styles.itemContent}>
                  {/* Product Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name || 'Unknown Product'}</Text>
                    
                    {/* Price Row */}
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>₹{item.currentPrice?.toLocaleString() || '0'}</Text>
                      {item._orderData?.items?.[0]?.itemCode?.units && (
                        <Text style={styles.itemUnit}>/ {item._orderData.items[0].itemCode.units}</Text>
                      )}
                    </View>

                    {/* Delivery Info */}
                    {item.deliveryCharges > 0 && (
                      <Text style={styles.deliveryCharge}>Delivery: ₹{item.deliveryCharges.toLocaleString()}</Text>
                    )}

                    {/* Brand and Category */}
                    {item.brand && item.brand !== 'Unknown' && (
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                    )}
                    {item.category && (
                      <Text style={styles.itemCategory} numberOfLines={1}>
                        {item.category}{item.subCategory ? ` • ${item.subCategory}` : ''}
                      </Text>
                    )}
                  </View>

                  {/* Quantity and Actions Row */}
                  <View style={styles.itemActionsRow}>
                    {/* Quantity Controls */}
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.leadId, item.itemCode, item.quantity, -1)}
                        disabled={refreshing}
                      >
                        <Icon name="minus" size={16} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.leadId, item.itemCode, item.quantity, 1)}
                        disabled={refreshing}
                      >
                        <Icon name="plus" size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteItem(item.leadId)}
                      disabled={refreshing}
                    >
                      <Icon name="trash-2" size={16} color="white" />
                    </TouchableOpacity>

                    {/* Item Total */}
                    <View style={styles.itemTotal}>
                      <Text style={styles.itemTotalLabel}>Total:</Text>
                      <Text style={styles.itemTotalAmount}>₹{item.totalPrice?.toLocaleString() || '0'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Totals */}
          {cartItems.length > 0 && (
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₹{calculateSubtotal().toLocaleString()}</Text>
              </View>
              {calculateDeliveryCharges() > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Delivery Charges:</Text>
                  <Text style={styles.totalValue}>₹{calculateDeliveryCharges().toLocaleString()}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                <Text style={styles.grandTotalAmount}>₹{total.toLocaleString()}</Text>
              </View>
            </View>
          )}

          {/* Proceed to Checkout Button */}
          {cartItems.length > 0 && (
            <LinearGradient
              colors={['#723FED', '#3B58EB']}
              style={styles.placeOrderButton}
            >
              <TouchableOpacity 
                style={styles.placeOrderButtonInner}
                onPress={() => navigation.navigate('DeliveryDetails')}
              >
                <Icon name="arrow-right" size={20} color="white" />
                <Text style={styles.placeOrderText}>Proceed to Checkout</Text>
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
          address: ''
        }}
      />
    </View>
  );
};

export default Cart; 