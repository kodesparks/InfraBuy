import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal, TextInput, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { orderService } from '../../services/api/orderService';
import { getStatusConfig, isTrackableStatus, shouldShowPayNow } from '../../utils/orderStatus';
import OrderTimeline from '../../components/orders/OrderTimeline';
import ChangeAddressModal from '../../components/orders/ChangeAddressModal';
import ChangeDateModal from '../../components/orders/ChangeDateModal';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showChangeAddressModal, setShowChangeAddressModal] = useState(false);
  const [showChangeDateModal, setShowChangeDateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [changeEligibility, setChangeEligibility] = useState(null);

  // Fetch orders from API
  const fetchOrders = async (status = null) => {
    try {
      setLoading(true);
      const result = await orderService.getAllOrders({
        status: status && status !== 'all' ? status : undefined,
        page: 1,
        limit: 50,
      });
      
      if (result.success && result.data) {
        const transformedOrders = (result.data.orders || [])
          .map(order => orderService.transformOrderToOrderModel(order))
          .filter(order => order !== null);
        
        // Filter out pending orders (cart items)
        const nonPendingOrders = transformedOrders.filter(
          order => order.status !== 'pending'
        );
        
        setOrders(nonPendingOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load orders on mount and when screen is focused
  useEffect(() => {
    fetchOrders(selectedStatus !== 'all' ? selectedStatus : null);
  }, [selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders(selectedStatus !== 'all' ? selectedStatus : null);
    }, [selectedStatus])
  );

  // Filter orders by search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.items?.some(item => item.name?.toLowerCase().includes(query))
    );
  });

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
    
    // Fetch order details and eligibility
    try {
      const leadId = order.leadId || order.id;
      const [detailsResult, eligibilityResult] = await Promise.all([
        orderService.getOrderDetails(leadId),
        orderService.checkChangeEligibility(leadId),
      ]);
      
      if (detailsResult.success) {
        setOrderDetails(detailsResult.data);
      }
      if (eligibilityResult.success) {
        setChangeEligibility(eligibilityResult.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleTrackOrder = async (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const handlePayment = (order) => {
    // Navigate to Payment screen with order data
    const originalOrder = order._orderData || {};
    const customerInfo = originalOrder.custUserId || {};
    
    navigation.navigate('Payment', {
      orderData: {
        id: order.id || order.leadId,
        orderNumber: order.orderNumber || order.leadId || order.id,
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        finalAmount: order.totalAmount || 0,
        deliveryAddress: order.deliveryAddress || '',
        deliveryPincode: order.deliveryPincode || '',
        customerInfo: {
          name: customerInfo.name || '',
          phone: originalOrder.custPhoneNum || originalOrder.receiverMobileNum || customerInfo.phone || '',
          email: customerInfo.email || '',
        },
      },
      deliveryDetails: {
        fullName: customerInfo.name || '',
        phoneNumber: originalOrder.custPhoneNum || originalOrder.receiverMobileNum || customerInfo.phone || '',
        deliveryAddress: order.deliveryAddress || '',
        city: '',
        state: '',
        pinCode: order.deliveryPincode || '',
      },
    });
  };


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  const renderOrderCard = (order) => {
    const statusConfig = getStatusConfig(order.status);
    const showPayNowBtn = shouldShowPayNow(order.status, order.paymentStatus);
    const isTrackable = isTrackableStatus(order.status);
    const firstItem = order.items?.[0];
    const moreItemsCount = order.items?.length > 1 ? order.items.length - 1 : 0;

    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <View style={styles.orderIconContainer}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.orderIconGradient}
              >
                <Icon name="package" size={20} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.orderId}>Order #{order.orderNumber || order.id}</Text>
              <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}
            onPress={() => isTrackable && handleTrackOrder(order)}
          >
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Alert */}
        {showPayNowBtn && (
          <View style={styles.paymentAlert}>
            <Icon name="alert-circle" size={18} color="#3B82F6" />
            <Text style={styles.paymentAlertText}>Payment Pending</Text>
            <TouchableOpacity
              style={styles.payNowButtonSmall}
              onPress={() => handlePayment(order)}
            >
              <Text style={styles.payNowButtonSmallText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Items Preview */}
        {firstItem && (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsSectionTitle}>Items</Text>
            <View style={styles.itemRow}>
              {firstItem.image && (
                <Image
                  source={{ uri: firstItem.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {firstItem.name}
                </Text>
                <Text style={styles.itemDetails}>
                  Qty: {firstItem.quantity} • {formatCurrency(firstItem.totalCost)}
                </Text>
              </View>
            </View>
            {moreItemsCount > 0 && (
              <Text style={styles.moreItemsText}>+{moreItemsCount} more item{moreItemsCount > 1 ? 's' : ''}</Text>
            )}
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summarySubtext}>
              {order.paymentStatus || 'Payment'} | Est. Delivery: {formatDate(order.deliveryExpectedDate)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewOrder(order)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          
          {isTrackable && (
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => handleTrackOrder(order)}
            >
              <Icon name="map-pin" size={16} color="#FFFFFF" />
              <Text style={styles.trackButtonText}>Track</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'delivered' && (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => Alert.alert('Rate Order', 'Rating feature coming soon')}
            >
              <Icon name="star" size={16} color="#723FED" />
              <Text style={styles.rateButtonText}>Rate</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.invoiceButton}
            onPress={() => Alert.alert('Invoice', `Invoice: ${order.invoiceNumber || 'N/A'}`)}
          >
            <Icon name="file-text" size={16} color="#723FED" />
            <Text style={styles.invoiceButtonText}>Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const statusFilters = [
    { key: 'all', label: 'All Orders' },
    { key: 'order_placed', label: 'Order Placed' },
    { key: 'vendor_accepted', label: 'Order Accepted' },
    { key: 'payment_done', label: 'Payment Done' },
    { key: 'order_confirmed', label: 'Order Confirmed' },
    { key: 'truck_loading', label: 'Loading' },
    { key: 'shipped', label: 'Dispatched' },
    { key: 'in_transit', label: 'On the Way' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (loading && orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#723FED" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order number or product..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedStatus === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(filter.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders(selectedStatus !== 'all' ? selectedStatus : null);
            }}
            colors={['#723FED']}
          />
        }
      >
        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="package" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Orders Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? 'No orders match your search'
                  : 'Your orders will appear here once you place them'}
              </Text>
            </View>
          ) : (
            filteredOrders.map(renderOrderCard)
          )}
        </View>
      </ScrollView>


      {/* Order Details Modal */}
      <Modal
        visible={showOrderDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrderDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowOrderDetailsModal(false)}>
                <Icon name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.orderDetailsContent}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Order Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order Number:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.orderNumber || selectedOrder.id}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order Date:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedOrder.orderDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusConfig(selectedOrder.status).color }]}>
                        <Text style={styles.statusTextSmall}>{getStatusConfig(selectedOrder.status).label}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Order Items</Text>
                    {selectedOrder.items?.map((item, index) => (
                      <View key={index} style={styles.detailItemRow}>
                        {item.image && (
                          <Image source={{ uri: item.image }} style={styles.detailItemImage} />
                        )}
                        <View style={styles.detailItemInfo}>
                          <Text style={styles.detailItemName}>{item.name}</Text>
                          <Text style={styles.detailItemText}>
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalCost)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Delivery Information</Text>
                    <Text style={styles.detailText}>{selectedOrder.deliveryAddress}</Text>
                    <Text style={styles.detailText}>PIN: {selectedOrder.deliveryPincode}</Text>
                    <Text style={styles.detailText}>
                      Expected Delivery: {formatDate(selectedOrder.deliveryExpectedDate)}
                    </Text>
                    {changeEligibility && (
                      <View style={styles.changeActions}>
                        {changeEligibility.canChangeAddress && (
                          <TouchableOpacity
                            style={styles.changeButton}
                            onPress={() => {
                              setShowOrderDetailsModal(false);
                              setShowChangeAddressModal(true);
                            }}
                          >
                            <Icon name="map-pin" size={16} color="#723FED" />
                            <Text style={styles.changeButtonText}>Change Address</Text>
                          </TouchableOpacity>
                        )}
                        {changeEligibility.canChangeDate && (
                          <TouchableOpacity
                            style={styles.changeButton}
                            onPress={() => {
                              setShowOrderDetailsModal(false);
                              setShowChangeDateModal(true);
                            }}
                          >
                            <Icon name="calendar" size={16} color="#723FED" />
                            <Text style={styles.changeButtonText}>Change Date</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Payment Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Status:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.paymentStatus || 'Pending'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Amount:</Text>
                      <Text style={styles.detailValueBold}>{formatCurrency(selectedOrder.totalAmount)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Delivery Charges:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(selectedOrder.deliveryCharges)}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Tracking Modal */}
      <Modal
        visible={showTrackingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTrackingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.trackingStatusLabel}>CURRENT STATUS</Text>
                {selectedOrder && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusConfig(selectedOrder.status).color }]}>
                    <Text style={styles.statusText}>{getStatusConfig(selectedOrder.status).label}</Text>
                  </View>
                )}
                {selectedOrder && (
                  <Text style={styles.trackingDescription}>
                    {getStatusConfig(selectedOrder.status).description}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowTrackingModal(false)}>
                <Icon name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.trackingContent}>
                  <OrderTimeline currentStatus={selectedOrder.status} />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Change Address Modal */}
      <ChangeAddressModal
        visible={showChangeAddressModal}
        onClose={() => {
          setShowChangeAddressModal(false);
          setShowOrderDetailsModal(true);
        }}
        order={selectedOrder}
        onSuccess={() => {
          fetchOrders(selectedStatus !== 'all' ? selectedStatus : null);
        }}
      />

      {/* Change Date Modal */}
      <ChangeDateModal
        visible={showChangeDateModal}
        onClose={() => {
          setShowChangeDateModal(false);
          setShowOrderDetailsModal(true);
        }}
        order={selectedOrder}
        onSuccess={() => {
          fetchOrders(selectedStatus !== 'all' ? selectedStatus : null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginRight: spacing.sm,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#723FED',
    borderColor: '#723FED',
  },
  filterChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
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
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  orderIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  statusBadgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  statusTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  paymentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  paymentAlertText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  payNowButtonSmall: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  payNowButtonSmallText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: spacing.sm,
  },
  itemsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moreItemsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  orderSummary: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  summarySubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#723FED',
  },
  trackButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trackButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  rateButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#723FED',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rateButtonText: {
    color: '#723FED',
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#723FED',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  invoiceButtonText: {
    color: '#723FED',
    fontSize: 14,
    fontWeight: '600',
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
  modalContentLarge: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '85%',
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
    color: '#723FED',
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
    gap: spacing.sm,
  },
  selectedPaymentMethod: {
    borderColor: '#723FED',
    backgroundColor: '#F3F4F6',
  },
  paymentMethodText: {
    fontSize: 16,
    color: colors.text,
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
    gap: spacing.sm,
  },
  payNowText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  orderDetailsContent: {
    gap: spacing.lg,
  },
  detailSection: {
    marginBottom: spacing.lg,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  detailValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  detailItemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailItemImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  detailItemText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  trackingContent: {
    paddingBottom: spacing.lg,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  trackingStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  trackingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  trackingPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  changeActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#723FED',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#723FED',
  },
});

export default OrdersScreen;