import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderContext = createContext();

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // Load orders from AsyncStorage on app start
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      const savedOrderHistory = await AsyncStorage.getItem('orderHistory');
      
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      if (savedOrderHistory) {
        setOrderHistory(JSON.parse(savedOrderHistory));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const saveOrders = async (newOrders) => {
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(newOrders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  const saveOrderHistory = async (newOrderHistory) => {
    try {
      await AsyncStorage.setItem('orderHistory', JSON.stringify(newOrderHistory));
    } catch (error) {
      console.error('Error saving order history:', error);
    }
  };

  // Create order from cart items
  const createOrder = (cartItems, shippingAddress, totalAmount) => {
    const orderId = `ORD-${Date.now()}`;
    const newOrder = {
      id: orderId,
      items: cartItems,
      shippingAddress,
      totalAmount,
      status: 'pending_payment', // pending_payment, paid, processing, shipped, delivered, cancelled
      paymentStatus: 'pending', // pending, paid, failed, refunded
      paymentMethod: null,
      paymentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      trackingNumber: null,
    };

    console.log('OrderContext - Creating new order:', newOrder);

    setOrders(prev => {
      const updatedOrders = [...prev, newOrder];
      console.log('OrderContext - Updated orders array:', updatedOrders);
      saveOrders(updatedOrders);
      return updatedOrders;
    });

    setCurrentOrder(newOrder);
    return newOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId, status, additionalData = {}) => {
    setOrders(prev => {
      const updatedOrders = prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status, 
              updatedAt: new Date().toISOString(),
              ...additionalData 
            }
          : order
      );
      saveOrders(updatedOrders);
      return updatedOrders;
    });

    // Update current order if it's the same
    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder(prev => ({
        ...prev,
        status,
        updatedAt: new Date().toISOString(),
        ...additionalData
      }));
    }
  };

  // Process payment
  const processPayment = (orderId, paymentMethod, paymentId) => {
    updateOrderStatus(orderId, 'paid', {
      paymentStatus: 'paid',
      paymentMethod,
      paymentId,
      status: 'processing'
    });
  };

  // Move order to history (when completed/cancelled)
  const moveOrderToHistory = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrderHistory(prev => {
        const updatedHistory = [...prev, order];
        saveOrderHistory(updatedHistory);
        return updatedHistory;
      });

      setOrders(prev => {
        const updatedOrders = prev.filter(o => o.id !== orderId);
        saveOrders(updatedOrders);
        return updatedOrders;
      });

      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(null);
      }
    }
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId) || 
           orderHistory.find(order => order.id === orderId);
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Get pending payment orders
  const getPendingPaymentOrders = () => {
    return orders.filter(order => order.status === 'pending_payment');
  };

  // Get active orders (processing, shipped)
  const getActiveOrders = () => {
    return orders.filter(order => 
      ['processing', 'shipped'].includes(order.status)
    );
  };

  const value = {
    orders,
    currentOrder,
    orderHistory,
    createOrder,
    updateOrderStatus,
    processPayment,
    moveOrderToHistory,
    getOrderById,
    getOrdersByStatus,
    getPendingPaymentOrders,
    getActiveOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
