import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import styles from '../../assets/styles/cart';
import OrderConfirmation from '../../components/OrderConfirmation';
import { colors } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import { useOrderContext } from '../../context/OrderContext';

const Cart = ({ navigation }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quantityInputs, setQuantityInputs] = useState({}); // Track input values per item
  
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.error || 'Failed to load cart items',
      });
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

    if (result.success) {
      // Don't show toast on success - silent update
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.error || 'Failed to update quantity',
      });
    }
  };

  const updateQuantityDirect = async (leadId, itemCode, newQuantityStr) => {
    const newQuantity = parseInt(newQuantityStr, 10);
    
    // Validate input
    if (isNaN(newQuantity) || newQuantity < 1) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Quantity',
        text2: 'Please enter a valid quantity (minimum 1)',
      });
      return;
    }

    setRefreshing(true);
    const result = await updateCartItemQuantity(leadId, itemCode, newQuantity);
    
    await loadCartItems();
    
    setRefreshing(false);

    if (result.success) {
      // Don't show toast on success - silent update
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.error || 'Failed to update quantity',
      });
    }
  };

  const deleteItem = async (leadId) => {
    setRefreshing(true);
    const result = await removeFromCart(leadId);
    // Refresh cart to update badge immediately
    await loadCartItems();
    setRefreshing(false);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.error || 'Failed to remove item',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Item Removed',
        text2: 'Item has been removed from cart',
      });
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Cart Empty',
        text2: 'Your cart is already empty.',
      });
      return;
    }

    setRefreshing(true);
    const result = await clearCartContext();
    // Refresh cart to update badge immediately
    await loadCartItems();
    setRefreshing(false);
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Cart Cleared',
        text2: result.message || 'All items have been removed from your cart.',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.error || 'Failed to clear cart',
      });
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Empty Cart',
        text2: 'Please add items to your cart before placing an order.',
      });
      return;
    }
    
    // Navigate to delivery details
    navigation.navigate('DeliveryDetails');
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
                        <Icon name="minus" size={18} color="#1F2937" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.quantityInput}
                        value={quantityInputs[`${item.leadId}_${item.itemCode}`] !== undefined 
                          ? String(quantityInputs[`${item.leadId}_${item.itemCode}`])
                          : String(item.quantity)}
                        keyboardType="number-pad"
                        onChangeText={(text) => {
                          // Update local state for this input
                          const key = `${item.leadId}_${item.itemCode}`;
                          setQuantityInputs(prev => ({
                            ...prev,
                            [key]: text,
                          }));
                        }}
                        onSubmitEditing={(e) => {
                          const key = `${item.leadId}_${item.itemCode}`;
                          const text = (quantityInputs[key] || e.nativeEvent?.text || '').trim();
                          if (text && text !== '') {
                            const numValue = parseInt(text, 10);
                            if (!isNaN(numValue) && numValue > 0) {
                              updateQuantityDirect(item.leadId, item.itemCode, text);
                              // Clear local input state after successful update
                              setQuantityInputs(prev => {
                                const newState = { ...prev };
                                delete newState[key];
                                return newState;
                              });
                            } else {
                              // Reset to current quantity if invalid
                              updateQuantityDirect(item.leadId, item.itemCode, String(item.quantity));
                              setQuantityInputs(prev => {
                                const newState = { ...prev };
                                delete newState[key];
                                return newState;
                              });
                            }
                          } else {
                            // Reset to current quantity if empty
                            updateQuantityDirect(item.leadId, item.itemCode, String(item.quantity));
                            setQuantityInputs(prev => {
                              const newState = { ...prev };
                              delete newState[key];
                              return newState;
                            });
                          }
                        }}
                        onBlur={(e) => {
                          const key = `${item.leadId}_${item.itemCode}`;
                          const text = (quantityInputs[key] || e.nativeEvent?.text || '').trim();
                          if (!text || text === '' || parseInt(text, 10) < 1) {
                            // Reset to current quantity if invalid
                            updateQuantityDirect(item.leadId, item.itemCode, String(item.quantity));
                            setQuantityInputs(prev => {
                              const newState = { ...prev };
                              delete newState[key];
                              return newState;
                            });
                          } else {
                            const numValue = parseInt(text, 10);
                            if (!isNaN(numValue) && numValue > 0) {
                              // Update on blur if valid
                              updateQuantityDirect(item.leadId, item.itemCode, text);
                              setQuantityInputs(prev => {
                                const newState = { ...prev };
                                delete newState[key];
                                return newState;
                              });
                            } else {
                              // Reset to current quantity if invalid
                              updateQuantityDirect(item.leadId, item.itemCode, String(item.quantity));
                              setQuantityInputs(prev => {
                                const newState = { ...prev };
                                delete newState[key];
                                return newState;
                              });
                            }
                          }
                        }}
                        selectTextOnFocus
                      />
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.leadId, item.itemCode, item.quantity, 1)}
                        disabled={refreshing}
                      >
                        <Icon name="plus" size={18} color="#1F2937" />
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
                  </View>

                  {/* Item Total - on new line */}
                  <View style={styles.itemTotal}>
                    <Text style={styles.itemTotalLabel}>Total:</Text>
                    <Text style={styles.itemTotalAmount}>₹{item.totalPrice?.toLocaleString() || '0'}</Text>
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