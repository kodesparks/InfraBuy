import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, borderRadius } from '../../assets/styles/global';

const OrdersScreen = ({ navigation }) => {
  const orders = [
    {
      id: 'ORD001',
      date: '2024-01-15',
      status: 'Delivered',
      statusColor: '#10B981',
      items: [
        { name: 'UltraTech Cement', quantity: '20 bags', price: '₹8,400' }
      ],
      total: '₹8,400'
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
      total: '₹15,750'
    }
  ];

  const handleTrackOrder = (order) => {
    navigation.navigate('TrackingScreen', { order });
  };

  const handleReorder = (order) => {
    navigation.navigate('Cart');
  };



  const renderOrderCard = (order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: order.statusColor }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      
      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>Total Amount {order.total}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => handleTrackOrder(order)}
          >
            <Text style={styles.trackButtonText}>Track</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.reorderButton}
            onPress={() => handleReorder(order)}
          >
            <LinearGradient
              colors={['#723FED', '#3B58EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.reorderButtonGradient}
            >
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Your Orders</Text>
          <Text style={styles.sectionSubtitle}>Track your construction material orders.</Text>
        </View>
        
        <View style={styles.ordersList}>
          {orders.map(renderOrderCard)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  

  
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  
  scrollContent: {
    paddingBottom: 100, // Add padding to the bottom of the ScrollView content
  },
  
  ordersSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  ordersList: {
    gap: spacing.md,
    paddingBottom: 100,
  },
  
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  orderDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  orderItems: {
    marginBottom: spacing.md,
  },
  
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  
  itemQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  trackButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  trackButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  reorderButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  
  reorderButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  reorderButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrdersScreen;
