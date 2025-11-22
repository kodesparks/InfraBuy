import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { useOrderContext } from '../../context/OrderContext';

const OrdersScreen = ({ navigation }) => {
  const { 
    orders, 
    orderHistory, 
    updateOrderStatus, 
    processPayment,
    getPendingPaymentOrders,
    getActiveOrders 
  } = useOrderContext();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Get orders from context
  const pendingOrders = getPendingPaymentOrders();
  const activeOrders = getActiveOrders();
  
  // Debug logging
  console.log('OrdersScreen - All orders:', orders);
  console.log('OrdersScreen - Pending orders:', pendingOrders);
  console.log('OrdersScreen - Active orders:', activeOrders);
  console.log('OrdersScreen - Order history:', orderHistory);

  // Combine real orders with some dummy data for demonstration
  const allOrders = [
    // Real pending payment orders
    ...pendingOrders.map(order => ({
      ...order,
      status: 'Payment Pending',
      statusColor: '#F59E0B',
      date: new Date(order.createdAt).toLocaleDateString()
    })),
    // Real active orders
    ...activeOrders.map(order => ({
      ...order,
      status: order.status === 'processing' ? 'Processing' : 'In Transit',
      statusColor: order.status === 'processing' ? '#8B5CF6' : '#3B82F6',
      date: new Date(order.createdAt).toLocaleDateString()
    })),
    // Real order history
    ...orderHistory.map(order => ({
      ...order,
      status: 'Delivered',
      statusColor: '#10B981',
      date: new Date(order.createdAt).toLocaleDateString()
    })),
    // Add some dummy orders only if no real orders exist
    ...(orders.length === 0 && orderHistory.length === 0 ? [
      {
        id: 'ORD001',
        date: '2024-01-15',
        status: 'Delivered',
        statusColor: '#10B981',
        items: [
          { name: 'UltraTech Cement', quantity: '20 bags', price: '₹8,400' }
        ],
        total: '₹8,400',
        totalAmount: 8400,
        createdAt: '2024-01-15T10:30:00.000Z',
        paymentStatus: 'paid'
      },
      {
        id: 'ORD002',
        date: '2024-01-12',
        status: 'In Transit',
        statusColor: '#3B82F6',
        items: [
          { name: 'ACC Cement', quantity: '30 bags', price: '₹11,850' },
          { name: 'Steel Rods', quantity: '10 pieces', price: '₹3,900' }
        ],
        total: '₹15,750',
        totalAmount: 15750,
        createdAt: '2024-01-12T14:20:00.000Z',
        paymentStatus: 'paid'
      }
    ] : [])
  ];

  const handleTrackOrder = (order) => {
    navigation.navigate('TrackingScreen', { order });
  };

  const handleReorder = (order) => {
    navigation.navigate('Cart');
  };

  const handlePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = () => {
    if (!paymentMethod.trim()) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const paymentId = `PAY-${Date.now()}`;
    processPayment(selectedOrder.id, paymentMethod, paymentId);
    
    Alert.alert(
      'Payment Successful!',
      `Payment ID: ${paymentId}\nYour order is now being processed.`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            setShowPaymentModal(false);
            setSelectedOrder(null);
            setPaymentMethod('');
          }
        }
      ]
    );
  };

  const renderOrderCard = (order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>
            {order.date || new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: order.statusColor }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              {item.quantity} {item.unit || ''} • {item.price || `₹${item.price}`}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            {order.total || `₹${order.totalAmount?.toFixed(2) || '0.00'}`}
          </Text>
        </View>
        
        <View style={styles.orderActions}>
          {order.status === 'Payment Pending' && (
            <TouchableOpacity 
              style={styles.paymentButton}
              onPress={() => handlePayment(order)}
            >
              <Icon name="card" size={16} color={colors.white} />
              <Text style={styles.paymentButtonText}>Pay Now</Text>
            </TouchableOpacity>
          )}
          
          {(order.status === 'In Transit' || order.status === 'Processing') && (
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => handleTrackOrder(order)}
            >
              <Icon name="location" size={16} color={colors.white} />
              <Text style={styles.trackButtonText}>Track</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'Delivered' && (
            <>
              <TouchableOpacity 
                style={styles.trackButton}
                onPress={() => handleTrackOrder(order)}
              >
                <Icon name="location" size={16} color={colors.white} />
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.reorderButton}
                onPress={() => handleReorder(order)}
              >
                <Icon name="refresh" size={16} color={colors.primary} />
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {allOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Orders Found</Text>
              <Text style={styles.emptyStateText}>
                Your orders will appear here once you place them
              </Text>
            </View>
          ) : (
            allOrders.map(renderOrderCard)
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentOrderId}>Order #{selectedOrder.id}</Text>
                <Text style={styles.paymentAmount}>
                  {selectedOrder.total || `₹${selectedOrder.totalAmount?.toFixed(2) || '0.00'}`}
                </Text>
                
                <View style={styles.paymentMethods}>
                  <Text style={styles.paymentMethodsTitle}>Select Payment Method:</Text>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethodOption, paymentMethod === 'UPI' && styles.selectedPaymentMethod]}
                    onPress={() => setPaymentMethod('UPI')}
                  >
                    <Icon name="phone-portrait" size={20} color={colors.primary} />
                    <Text style={styles.paymentMethodText}>UPI Payment</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethodOption, paymentMethod === 'Card' && styles.selectedPaymentMethod]}
                    onPress={() => setPaymentMethod('Card')}
                  >
                    <Icon name="card" size={20} color={colors.primary} />
                    <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethodOption, paymentMethod === 'Net Banking' && styles.selectedPaymentMethod]}
                    onPress={() => setPaymentMethod('Net Banking')}
                  >
                    <Icon name="business" size={20} color={colors.primary} />
                    <Text style={styles.paymentMethodText}>Net Banking</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.payNowButton, !paymentMethod && styles.payNowButtonDisabled]}
                  onPress={handleProcessPayment}
                  disabled={!paymentMethod}
                >
                  <LinearGradient
                    colors={paymentMethod ? ['#10B981', '#059669'] : ['#9CA3AF', '#6B7280']}
                    style={styles.payNowGradient}
                  >
                    <Icon name="checkmark-circle" size={20} color={colors.white} />
                    <Text style={styles.payNowText}>Pay Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  ordersContainer: {
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  orderDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  orderItems: {
    marginBottom: spacing.sm,
  },
  orderItem: {
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  itemDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  orderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  trackButton: {
    backgroundColor: colors.accentSuccess,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reorderButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  paymentDetails: {
    alignItems: 'center',
  },
  paymentOrderId: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  paymentMethods: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  paymentMethodText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  payNowButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  payNowButtonDisabled: {
    opacity: 0.5,
  },
  payNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  payNowText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default OrdersScreen;