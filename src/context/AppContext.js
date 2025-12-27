import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WAREHOUSE_LOCATIONS, PRODUCT_CATEGORY_MAPPING } from '../services/config/warehouseConfig';
import { distanceService } from '../services/location/distanceService';
import { cartService } from '../services/api/cartService';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);
  
  // Delivery and location state
  const [userPincode, setUserPincode] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [showPincodeModal, setShowPincodeModal] = useState(false);

  // Load saved pincode on app start
  useEffect(() => {
    loadSavedPincode();
  }, []);

  const loadSavedPincode = async () => {
    try {
      const savedPincode = await AsyncStorage.getItem('userPincode');
      const savedLocation = await AsyncStorage.getItem('userLocation');
      
      if (savedPincode && savedLocation) {
        setUserPincode(savedPincode);
        setUserLocation(JSON.parse(savedLocation));
        calculateDeliveryInfo(JSON.parse(savedLocation));
      } else {
        // Show pincode modal if no pincode is saved
        setShowPincodeModal(true);
      }
    } catch (error) {
      console.error('Error loading saved pincode:', error);
      setShowPincodeModal(true);
    }
  };

  const calculateDeliveryInfo = (location) => {
    try {
      const deliveryData = {};
      
      Object.keys(WAREHOUSE_LOCATIONS).forEach(category => {
        const warehouse = WAREHOUSE_LOCATIONS[category];
        const distance = distanceService.calculateDistance(location, warehouse.location);
        const deliveryCharges = distanceService.calculateDeliveryCharges(
          distance, 
          category, 
          warehouse
        );
        
        deliveryData[category] = {
          warehouse: warehouse.name,
          distance: distance,
          deliveryCharges: deliveryCharges,
          deliveryTime: getDeliveryTimeEstimate(distance),
        };
      });
      
      setDeliveryInfo(deliveryData);
    } catch (error) {
      console.error('Error calculating delivery info:', error);
    }
  };

  const getDeliveryTimeEstimate = (distance) => {
    if (distance <= 10) return 'Same day delivery available';
    if (distance <= 50) return '1-2 days delivery available';
    if (distance <= 100) return '2-3 days delivery available';
    if (distance <= 200) return '3-5 days delivery available';
    return '5-7 days delivery available';
  };

  const handlePincodeSet = async (pincodeData) => {
    try {
      const { pincode, location } = pincodeData;
      
      // Validate location data before saving
      if (!location || !location.latitude || !location.longitude) {
        console.error('Invalid location data:', location);
        throw new Error('Invalid location data received. Please try again.');
      }
      
      // Prepare location object with required fields
      const locationToSave = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || `${pincode}, India`,
        city: location.city,
        state: location.state,
        district: location.district,
        region: location.region,
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userPincode', pincode);
      await AsyncStorage.setItem('userLocation', JSON.stringify(locationToSave));
      
      // Update state
      setUserPincode(pincode);
      setUserLocation(locationToSave);
      calculateDeliveryInfo(locationToSave);
      setShowPincodeModal(false);
    } catch (error) {
      console.error('Error saving pincode:', error);
      // You might want to show an alert to the user here
    }
  };

  const handleChangePincode = () => {
    setShowPincodeModal(true);
  };

  const getDeliveryInfoForCategory = (categoryName) => {
    const categoryKey = PRODUCT_CATEGORY_MAPPING[categoryName];
    return deliveryInfo[categoryKey] || null;
  };

  const calculateProductPrice = (basePrice, categoryName, quantity = 1) => {
    const categoryKey = PRODUCT_CATEGORY_MAPPING[categoryName];
    const deliveryData = deliveryInfo[categoryKey];
    
    if (!deliveryData) {
      return basePrice * quantity;
    }
    
    return distanceService.calculateTotalPrice(
      basePrice, 
      deliveryData.deliveryCharges, 
      quantity
    );
  };

  // Cart functions - using API
  const addToCart = async (product, quantity = 1) => {
    // Validate product object
    if (!product || (!product.id && !product._id)) {
      console.error('Invalid product object provided to addToCart:', product);
      return { success: false, error: 'Invalid product information' };
    }

    if (!userPincode) {
      return { success: false, error: 'Pincode is required to add items to cart' };
    }

    try {
      const itemCode = product._id || product.id;
      const result = await cartService.addToCart({
        itemCode: itemCode,
        qty: quantity,
        deliveryPincode: userPincode,
        deliveryAddress: '',
        deliveryExpectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        custPhoneNum: '',
        receiverMobileNum: '',
      });

      if (result.success) {
        // Refresh cart items after adding - this will update cartCount automatically
        await fetchCartItems();
        return { success: true, message: result.message || 'Item added to cart successfully' };
      }

      return { success: false, error: result.error || 'Failed to add item to cart' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: 'Unable to add item to cart. Please try again.' };
    }
  };

  // Fetch cart items from API
  const fetchCartItems = async () => {
    try {
      const result = await cartService.getCartItems({ page: 1, limit: 50 });
      
      if (result.success && result.data) {
        const orders = result.data.orders || [];
        
        const cartItems = orders
          .map(order => {
            const transformed = cartService.transformOrderToCartItem(order);
            if (!transformed) {
              console.warn('⚠️ Failed to transform order:', order);
            }
            return transformed;
          })
          .filter(item => item !== null);
        
        setCartItems(cartItems);
        const totalCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
        setCartCount(totalCount);
        return { success: true, items: cartItems };
      }

      // Empty cart
      setCartItems([]);
      setCartCount(0);
      return { success: true, items: [] };
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return { success: false, error: 'Unable to load cart items' };
    }
  };

  const updateCartItemQuantity = async (leadId, itemCode, newQuantity) => {
    if (newQuantity <= 0) {
      return await removeFromCart(leadId);
    }
    
    try {
      const result = await cartService.updateQuantity(leadId, {
        itemCode: itemCode,
        qty: newQuantity,
      });

      if (result.success) {
        // Refresh cart items after update
        await fetchCartItems();
        return { success: true, message: result.message || 'Quantity updated successfully' };
      }

      return { success: false, error: result.error || 'Failed to update quantity' };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: 'Unable to update quantity. Please try again.' };
    }
  };

  const removeFromCart = async (leadId) => {
    try {
      const result = await cartService.removeFromCart(leadId);

      if (result.success) {
        // Refresh cart items after removal - this will update cartCount automatically
        await fetchCartItems();
        return { success: true, message: result.message || 'Item removed from cart successfully' };
      }

      return { success: false, error: result.error || 'Failed to remove item from cart' };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: 'Unable to remove item from cart. Please try again.' };
    }
  };

  const clearCart = async () => {
    try {
      // Pass current cart items as fallback in case the clear endpoint returns 404
      const result = await cartService.clearCart(cartItems);

      if (result.success) {
        // Clear local state
        setCartItems([]);
        setCartCount(0);
        // Refresh from API to ensure consistency
        await fetchCartItems();
        return { 
          success: true, 
          message: result.message || 'Cart cleared successfully',
          clearedCount: result.clearedCount || 0,
          ordersCleared: result.ordersCleared || [],
          fallback: result.fallback || false,
        };
      }

      return { success: false, error: result.error || 'Failed to clear cart' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: 'Unable to clear cart. Please try again.' };
    }
  };

  // Notification functions
  const addNotification = () => {
    setNotificationCount(prev => prev + 1);
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  const markNotificationAsRead = () => {
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const value = {
    // Cart state
    cartItems,
    cartCount,
    notificationCount,
    fetchCartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    addNotification,
    clearNotifications,
    markNotificationAsRead,
    
    // Delivery and location state
    userPincode,
    userLocation,
    deliveryInfo,
    showPincodeModal,
    setShowPincodeModal,
    handlePincodeSet,
    handleChangePincode,
    getDeliveryInfoForCategory,
    calculateProductPrice,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
