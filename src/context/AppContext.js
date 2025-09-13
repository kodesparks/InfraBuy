import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WAREHOUSE_LOCATIONS, PRODUCT_CATEGORY_MAPPING } from '../services/config/warehouseConfig';
import { distanceService } from '../services/location/distanceService';

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
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userPincode', pincode);
      await AsyncStorage.setItem('userLocation', JSON.stringify(location));
      
      // Update state
      setUserPincode(pincode);
      setUserLocation(location);
      calculateDeliveryInfo(location);
      setShowPincodeModal(false);
    } catch (error) {
      console.error('Error saving pincode:', error);
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

  // Cart functions
  const addToCart = (product, quantity = 1) => {
    // Validate product object
    if (!product || !product.id) {
      console.error('Invalid product object provided to addToCart:', product);
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
        return updatedItems;
      } else {
        // Add new item to cart
        const newItem = {
          id: product.id,
          name: product.name || 'Unknown Product',
          price: product.price || 0,
          unit: product.unit || 'per unit',
          quantity: quantity,
          image: product.image || require('../assets/images/cement.png'),
          type: product.type || 'Unknown',
          grade: product.grade || 'Unknown',
          brand: product.brand || 'Unknown',
          category: product.category || 'Unknown'
        };
        const updatedItems = [...prevItems, newItem];
        setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
        return updatedItems;
      }
    });
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
      return updatedItems;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      setCartCount(updatedItems.reduce((total, item) => total + item.quantity, 0));
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
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
