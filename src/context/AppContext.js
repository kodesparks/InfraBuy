import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(2);
  const [notificationCount, setNotificationCount] = useState(3);

  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  const removeFromCart = () => {
    setCartCount(prev => Math.max(0, prev - 1));
  };

  const clearCart = () => {
    setCartCount(0);
  };

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
    cartCount,
    notificationCount,
    addToCart,
    removeFromCart,
    clearCart,
    addNotification,
    clearNotifications,
    markNotificationAsRead,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
