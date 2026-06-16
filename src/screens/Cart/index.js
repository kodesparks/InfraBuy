import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl, Modal, FlatList, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import createStyles from '../../assets/styles/cart';
import OrderConfirmation from '../../components/OrderConfirmation';
import { useTheme } from '../../context/ThemeContext';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';
import { useAppContext } from '../../context/AppContext';
import { useOrderContext } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { cartService } from '../../services/api/cartService';
import { useTranslation } from 'react-i18next';
import Skeleton from '../../components/common/Skeleton';

const Cart = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quantityInputs, setQuantityInputs] = useState({}); // Track input values per item
  const [placingOrder, setPlacingOrder] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const STATES = [
    'Andhra Pradesh',
    'Telangana',
    'Tamilnadu',
    'Karnataka',
    'Chattisgarh',
    'Odisha',
    'Other'
  ];

  // Get cart data from AppContext
  const {
    cartItems,
    cartCount,
    fetchCartItems,
    updateCartItemQuantity,
    removeFromCart,
    clearCart: clearCartContext,
    userPincode
  } = useAppContext();

  // Fetch cart items on mount
  useEffect(() => {
    loadCartItems();
    if (user) {
      setCity(user.city || '');
      setState(user.state || '');
      setPostalCode(userPincode || user.pincode || '');
    }
  }, [user, userPincode]);

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
        text1: t('Error'),
        text2: result.error || t('Failed to load cart items'),
      });
    }
  };

  // Get order management from OrderContext
  const { createOrder } = useOrderContext();

  const getUnitForCategory = (categoryName) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('cement')) {
      return t('Load');
    }
    if (name.includes('concrete') || name.includes('mixer') || name.includes('others')) {
      return t('Units');
    }
    if (name.includes('steel') || name.includes('iron')) {
      return t('Tonnes');
    }
    return '';
  };

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

  const updateQuantity = async (id, leadId, itemCode, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;

    // If quantity becomes 0 or less, delete the item instead
    if (newQuantity <= 0) {
      deleteItem(id, leadId, itemCode);
      return;
    }

    if (newQuantity === currentQuantity) return;

    setRefreshing(true);
    const result = await updateCartItemQuantity(leadId || id, itemCode, newQuantity);

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

  const updateQuantityDirect = async (id, leadId, itemCode, newQuantityStr) => {
    const newQuantity = parseInt(newQuantityStr, 10);

    // Validate input
    if (isNaN(newQuantity) || newQuantity < 1) {
      Toast.show({
        type: 'error',
        text1: t('Invalid Quantity'),
        text2: t('Please enter a valid quantity (minimum 1)'),
      });
      return;
    }

    setRefreshing(true);
    const result = await updateCartItemQuantity(leadId || id, itemCode, newQuantity);

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

  const deleteItem = async (id, leadId = null, itemCode = null) => {
    // Determine the primary ID to use (lead ID is preferred for URLs in this system)
    const primaryId = leadId || id;
    
    if (!primaryId || !itemCode) {
      console.warn('Cannot delete: missing leadId/id or itemCode', { primaryId, itemCode });
      return;
    }

    setRefreshing(true);
    const result = await removeFromCart(primaryId, itemCode);
    
    // Refresh cart list to ensure everything is in sync
    await loadCartItems();
    
    setRefreshing(false);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: result.error || t('Failed to remove item'),
      });
    } else {
      Toast.show({
        type: 'success',
        text1: t('Item Removed'),
        text2: t('Item has been removed from cart'),
      });
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'info',
        text1: t('Cart Empty'),
        text2: t('Your cart is already empty.'),
      });
      return;
    }

    setRefreshing(true);
    const result = await clearCartContext();
    // Refresh cart to update badge immediately (though clearCart already does this)
    await loadCartItems();
    setRefreshing(false);
    if (result.success) {
      const clearedCount = result.clearedCount || cartItems.length;
      const message = result.fallback
        ? t('Cleared {{count}} items individually', { count: clearedCount })
        : result.message || t('Successfully removed {{count}} items from your cart.', { count: clearedCount });

      Toast.show({
        type: 'success',
        text1: t('Cart Cleared'),
        text2: message,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: result.error || t('Failed to clear cart'),
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: t('Empty Enquiry List'),
        text2: t('Please add items before placing an order.'),
      });
      return;
    }

    setPlacingOrder(true);

    try {
      const deliveryExpectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const orderData = {
        deliveryAddress: user?.address || t('Not Provided'),
        deliveryPincode: postalCode || '000000',
        deliveryExpectedDate,
        receiverMobileNum: user?.mobile || user?.phoneNumber || '0000000000',
        receiverName: user?.name || user?.fullName || t('Enquiry User'),
        email: user?.email || '',
        city: city || t('Not Provided'),
        state: state || t('Not Provided'),
      };

      // De-duplicate leadIds so we only place each unique order once
      const uniqueLeadIds = [...new Set(cartItems.map(item => item.leadId || item.id))];

      const placeOrderPromises = uniqueLeadIds.map(leadId =>
        cartService.placeOrder(leadId, orderData)
      );

      const results = await Promise.all(placeOrderPromises);
      const failedOrders = results.filter(r => !r.success);

      if (failedOrders.length > 0) {
        const errorMessages = failedOrders.map(r => r.error).join(', ');
        Toast.show({
          type: 'error',
          text1: t('Enquiry Submission Failed'),
          text2: `${t('Some enquiries could not be submitted:')} ${errorMessages}`,
        });
        await fetchCartItems();
      } else {
        await fetchCartItems();
        Toast.show({
          type: 'success',
          text1: t('Enquiry Submitted Successfully!'),
          text2: t('Your enquiry has been submitted successfully.'),
        });
        navigation.navigate('MainApp', { screen: 'Orders' });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Failed to submit enquiry. Please try again.'),
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleContinueShopping = () => {
    setShowConfirmation(false);
    clearCartContext(); // Clear cart after successful order
    navigation.navigate('MainApp');
  };

  const total = calculateTotal();

  const renderCartSkeleton = () => {
    const skeletonItems = [1, 2];
    return (
      <View style={styles.cartCard}>
        <View style={styles.cartHeader}>
          <Skeleton width={120} height={24} borderRadius={4} />
          <Skeleton width={80} height={32} borderRadius={16} />
        </View>
        {skeletonItems.map((item) => (
          <View key={item} style={styles.itemBorderWrapper}>
            <View style={[styles.itemInner, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF' }]}>
              <Skeleton width={80} height={80} borderRadius={8} style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton width={100} height={32} borderRadius={16} />
                  <Skeleton width={32} height={32} borderRadius={16} />
                </View>
              </View>
            </View>
          </View>
        ))}
        <Skeleton width="100%" height={150} borderRadius={16} style={{ marginTop: 20 }} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {renderCartSkeleton()}
        </ScrollView>
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
            <Text style={styles.cartTitle}>{t('Enquiry Items')} ({cartItems.length})</Text>
            {cartItems.length > 0 && (
              <TouchableOpacity style={styles.clearCartButton} onPress={handleClearCart}>
                <Icon name="trash-2" size={16} color="white" />
                <Text style={styles.clearCartText}>{t('Clear All')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Icon name="shopping-cart" size={60} color={colors.darkGray} />
              <Text style={styles.emptyCartText}>{t('Your enquiry list is empty')}</Text>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.continueShoppingButton}
              >
                <TouchableOpacity
                  style={styles.continueShoppingButtonInner}
                  onPress={() => navigation.navigate('MainApp')}
                >
                  <Icon name="shopping-bag" size={20} color="white" />
                  <Text style={styles.continueShoppingText}>{t('Continue Shopping')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            cartItems.map((item) => (
              <LinearGradient
                key={`${item.id || item._id}_${item.itemCode}`}
                colors={['#FF9D2D', '#723FED', '#3B82F6']} // Orange, Violet, Blue
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.itemBorderWrapper}
              >
                <View style={styles.itemInner}>
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
                    <Text style={styles.itemName} numberOfLines={2}>{item.name || t('Unknown Product')}</Text>

                    {/* Price hidden per handoff */}
                    <View style={styles.priceRow}>
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
                        {t(item.category)}{item.subCategory ? ` • ${t(item.subCategory)}` : ''}
                      </Text>
                    )}
                  </View>

                  {/* Quantity and Actions Row */}
                  <View style={styles.itemActionsRow}>
                    {/* Quantity Controls */}
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.leadId, item.itemCode, item.quantity, -1)}
                        disabled={refreshing}
                      >
                        <Icon name="minus" size={18} color="#723FED" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.quantityInput}
                        value={quantityInputs[`${item.id}_${item.itemCode}`] !== undefined
                          ? String(quantityInputs[`${item.id}_${item.itemCode}`])
                          : String(item.quantity)}
                        keyboardType="number-pad"
                        onChangeText={(text) => {
                          // Update local state for this input
                          const key = `${item.id}_${item.itemCode}`;
                          setQuantityInputs(prev => ({
                            ...prev,
                            [key]: text,
                          }));
                        }}
                        onSubmitEditing={(e) => {
                          const key = `${item.id}_${item.itemCode}`;
                          const text = (quantityInputs[key] || e.nativeEvent?.text || '').trim();
                          if (text && text !== '') {
                            const numValue = parseInt(text, 10);
                            if (!isNaN(numValue) && numValue > 0) {
                              updateQuantityDirect(item.id, item.leadId, item.itemCode, text);
                              // Clear local input state after successful update
                              setQuantityInputs(prev => {
                                const newState = { ...prev };
                                delete newState[key];
                                return newState;
                              });
                            } else {
                              // Reset to current quantity if invalid
                              updateQuantityDirect(item.id, item.leadId, item.itemCode, String(item.quantity));
                              setQuantityInputs(prev => {
                                const newState = { ...prev };
                                delete newState[key];
                                return newState;
                              });
                            }
                          } else {
                            // Reset to current quantity if empty
                            updateQuantityDirect(item.id, item.leadId, item.itemCode, String(item.quantity));
                            setQuantityInputs(prev => {
                              const newState = { ...prev };
                              delete newState[key];
                              return newState;
                            });
                          }
                        }}
                        onBlur={(e) => {
                          const key = `${item.id}_${item.itemCode}`;
                          const text = (quantityInputs[key] || e.nativeEvent?.text || '').trim();
                          if (!text || text === '' || parseInt(text, 10) < 1) {
                            // Reset to current quantity if invalid
                            updateQuantityDirect(item.id, item.leadId, item.itemCode, String(item.quantity));
                            setQuantityInputs(prev => {
                              const newState = { ...prev };
                              delete newState[key];
                              return newState;
                            });
                          } else {
                            const numValue = parseInt(text, 10);
                            if (!isNaN(numValue) && numValue > 0) {
                              // Update on blur if valid
                              updateQuantityDirect(item.id, item.leadId, item.itemCode, text);
                              setQuantityInputs(prev => {
                                const newState = { ...prev };
                                delete newState[key];
                                return newState;
                              });
                            } else {
                              // Reset to current quantity if invalid
                              updateQuantityDirect(item.id, item.leadId, item.itemCode, String(item.quantity));
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
                      <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '600', marginHorizontal: 4 }}>
                        {getUnitForCategory(item.category)}
                      </Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.leadId, item.itemCode, item.quantity, 1)}
                        disabled={refreshing}
                      >
                        <Icon name="plus" size={18} color="#723FED" />
                      </TouchableOpacity>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteItem(item.id, item.leadId, item.itemCode)}
                      disabled={refreshing}
                    >
                      <Icon name="trash-2" size={16} color="white" />
                    </TouchableOpacity>
                  </View>


                </View>
              </View>
            </LinearGradient>
            ))
          )}



          {/* Delivery Details */}
          {cartItems.length > 0 && (
            <LinearGradient
              colors={['#FF9D2D', '#723FED', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorderWrapper}
            >
              <View style={styles.sectionInner}>
                <View style={styles.deliveryDetailsContainer}>
              <Text style={styles.deliveryTitle}>
                {t('Delivery Details')} <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 'normal' }}>{t('(optional)')}</Text>
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('Place')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('Enter Place')}
                  placeholderTextColor="#9CA3AF"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.inputLabel}>{t('State')}</Text>
                  <TouchableOpacity
                    style={[styles.textInput, styles.dropdownInput]}
                    onPress={() => setShowStateDropdown(true)}
                  >
                    <Text style={[styles.dropdownText, !state && styles.placeholderText]}>
                      {state || t('Select State')}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.inputLabel}>{t('Postal Code')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('Enter Postal Code')}
                    placeholderTextColor="#9CA3AF"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
                </View>
              </View>
            </LinearGradient>
          )}

        </View>
      </ScrollView>

      {/* Floating Send Enquiry Button */}
      {cartItems.length > 0 && (
        <View style={[
          styles.footerContainer, 
          { bottom: Platform.OS === 'ios' ? insets.bottom + 20 : 25 }
        ]}>
          <LinearGradient
            colors={colors.primaryGradient}
            style={[styles.floatingEnquiryButton, placingOrder && { opacity: 0.7 }]}
          >
            <TouchableOpacity
              style={[styles.placeOrderButtonInner, { height: '100%', paddingVertical: 0 }]}
              onPress={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="white" />
                  <Text style={styles.placeOrderButtonText}>{t('Send Enquiry')}</Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

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

      {/* State Selection Modal */}
      <Modal
        visible={showStateDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStateDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStateDropdown(false)}
        >
          <View style={styles.dropdownModalContainer}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>{t('Select State')}</Text>
              <TouchableOpacity onPress={() => setShowStateDropdown(false)}>
                <Icon name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    state === item && styles.dropdownItemActive
                  ]}
                  onPress={() => {
                    setState(item);
                    setShowStateDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    state === item && styles.dropdownItemTextActive
                  ]}>{item}</Text>
                  {state === item && (
                    <Icon name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <CustomerCareFooter />
    </View>
  );
};

export default Cart;

