import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, ActivityIndicator, RefreshControl, Image, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { orderService } from '../../services/api/orderService';
import { getAccessToken } from '../../services/auth/tokenManager';
import { getStatusConfig, isTrackableStatus, shouldShowPayNow } from '../../utils/orderStatus';
import { downloadAndOpenPdf } from '../../utils/pdfDownload';
import OrderTimeline from '../../components/orders/OrderTimeline';
import ChangeAddressModal from '../../components/orders/ChangeAddressModal';
import ChangeDateModal from '../../components/orders/ChangeDateModal';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';

// Helper function to format status labels (replace underscores with spaces and capitalize)
const formatStatusLabel = (label) => {
  if (!label) return '';
  // Replace underscores with spaces
  const formatted = label.replace(/_/g, ' ');
  // Capitalize each word
  return formatted
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showChangeAddressModal, setShowChangeAddressModal] = useState(false);
  const [showChangeDateModal, setShowChangeDateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [changeEligibility, setChangeEligibility] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

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

  // No search filtering - show all orders
  const filteredOrders = orders;

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setOrderDetails(null); // Reset previous order details
    setShowOrderDetailsModal(true);
    setOrderDetailsLoading(true);
    
    // Fetch order details and eligibility
    try {
      const leadId = order.leadId || order.id;
      const [detailsResult, eligibilityResult] = await Promise.all([
        orderService.getOrderDetails(leadId),
        orderService.checkChangeEligibility(leadId),
      ]);
      
      if (detailsResult.success) {
        console.log('📋 Order details received:', {
          hasPaymentInfo: !!detailsResult.data?.paymentInfo,
          paymentStatus: detailsResult.data?.paymentInfo?.paymentStatus,
          dataKeys: Object.keys(detailsResult.data || {}),
        });
        setOrderDetails(detailsResult.data);
      }
      if (eligibilityResult.success) {
        setChangeEligibility(eligibilityResult.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleTrackOrder = async (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
    setTrackingData(null);
    setTrackingLoading(true);
    
    try {
      const leadId = order.leadId || order.id;
      console.log('🔍 Fetching tracking for order:', leadId);
      const result = await orderService.getOrderTracking(leadId);
      
      console.log('📦 Tracking result:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        console.log('✅ Tracking data received:', {
          hasDelivery: !!result.data.delivery,
          delivery: result.data.delivery,
          hasPayment: !!result.data.payment,
          hasVendor: !!result.data.vendor,
          hasTimeline: !!result.data.statusTimeline,
        });
        setTrackingData(result.data);
      } else {
        console.error('❌ Tracking fetch failed:', result.error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.error || 'Failed to load tracking information',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching tracking:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to load tracking information. Please try again.',
      });
    } finally {
      setTrackingLoading(false);
    }
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

  // Price hiding: do not show amounts anywhere
  const formatPricePlaceholder = () => '—';

  /**
   * PDF: show only one at a time (handoff §3).
   * Order Accepted (vendor_accepted) → Quote only.
   * Order confirmed / payment (order_confirmed, payment_done, truck_loading, shipped) → Sales Order only (no Quote).
   * Delivery (in_transit, out_for_delivery, delivered) → Invoice + E-way only (no Quote, no Sales Order).
   */
  const STATUSES_HIDE_MODIFICATIONS = ['truck_loading', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
  const canShowOrderModifications = (status) => status && !STATUSES_HIDE_MODIFICATIONS.includes(status);

  const [pdfLoading, setPdfLoading] = useState(null);
  const handlePdf = async (leadId, type, label, orderStatus) => {
    setPdfLoading(`${leadId}-${type}`);
    try {
      const token = await getAccessToken();
      if (!token) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Please sign in to download' });
        return;
      }
      const fullUrl = orderService.getPdfUrl(leadId, type);
      if (!fullUrl) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid document type' });
        return;
      }
      const result = await downloadAndOpenPdf(fullUrl, token, label);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Downloaded',
          text2: result.opened === false ? 'Saved to Downloads. Open from File Manager.' : 'Opened.',
        });
      } else if (type === 'quote') {
        const isPlacedOrPending = !orderStatus || orderStatus === 'order_placed' || orderStatus === 'pending';
        const message = isPlacedOrPending
          ? 'Quote is generated when the order is confirmed.'
          : (result.apiMessage || result.error || 'Quote not available; try again in a moment.');
        Toast.show({ type: 'info', text1: 'Quote', text2: message });
      } else {
        Toast.show({ type: 'error', text1: 'Download failed', text2: result.error || result.apiMessage || 'Try again' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Download failed' });
    } finally {
      setPdfLoading(null);
    }
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
                  Qty: {firstItem.quantity}
                </Text>
              </View>
            </View>
            {moreItemsCount > 0 && (
              <Text style={styles.moreItemsText}>+{moreItemsCount} more item{moreItemsCount > 1 ? 's' : ''}</Text>
            )}
          </View>
        )}

        {/* Order Summary - price hidden per handoff */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>{formatPricePlaceholder()}</Text>
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
              onPress={() => Toast.show({
                type: 'info',
                text1: 'Rate Order',
                text2: 'Rating feature coming soon',
              })}
            >
              <Icon name="star" size={16} color="#723FED" />
              <Text style={styles.rateButtonText}>Rate</Text>
            </TouchableOpacity>
          )}
          
          {['truck_loading','shipped','in_transit','out_for_delivery','delivered'].includes(order.status) && (
            <TouchableOpacity
              style={styles.invoiceButton}
              onPress={() => handleViewOrder(order)}
            >
              <Icon name="file-text" size={16} color="#723FED" />
              <Text style={styles.invoiceButtonText}>Documents</Text>
            </TouchableOpacity>
          )}
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
                Your orders will appear here once you place them
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
                <Icon name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {orderDetailsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#723FED" />
                <Text style={styles.loadingText}>Loading order details...</Text>
              </View>
            ) : selectedOrder && (
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
                          <Text style={styles.detailItemText}>Qty: {item.quantity}</Text>
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
                    {canShowOrderModifications(selectedOrder?.status) && changeEligibility && (
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
                            <Text style={styles.changeButtonText}>Change Delivery Date</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  {orderDetails?.deliveryInfo && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Delivery Tracking</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Driver:</Text>
                        <Text style={styles.detailValue}>{orderDetails.deliveryInfo.driverName || '—'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Driver Phone:</Text>
                        <Text style={styles.detailValue}>{orderDetails.deliveryInfo.driverPhone || '—'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Truck Number:</Text>
                        <Text style={styles.detailValue}>{orderDetails.deliveryInfo.truckNumber || '—'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Vehicle Type:</Text>
                        <Text style={styles.detailValue}>{orderDetails.deliveryInfo.vehicleType || '—'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivery Status:</Text>
                        <Text style={styles.detailValue}>{orderDetails.deliveryInfo.deliveryStatus || '—'}</Text>
                      </View>
                      {(orderDetails.deliveryInfo.expectedDeliveryDate || orderDetails.deliveryInfo.estimatedArrival) && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Expected:</Text>
                          <Text style={styles.detailValue}>
                            {formatDate(orderDetails.deliveryInfo.expectedDeliveryDate || orderDetails.deliveryInfo.estimatedArrival)}
                          </Text>
                        </View>
                      )}
                      {orderDetails.deliveryInfo.deliveryNotes ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Notes:</Text>
                          <Text style={styles.detailValue}>{orderDetails.deliveryInfo.deliveryNotes}</Text>
                        </View>
                      ) : null}
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Payment Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Status:</Text>
                      {(() => {
                        const paymentStatus = orderDetails?.paymentInfo?.paymentStatus || selectedOrder?.paymentStatus || 'pending';
                        const isSuccessful = paymentStatus === 'successful';
                        return (
                          <Text style={[styles.detailValue, { color: isSuccessful ? '#10B981' : '#EF4444', fontWeight: '600' }]}>
                            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                          </Text>
                        );
                      })()}
                    </View>
                    {orderDetails?.paymentInfo?.paymentMethod && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Method:</Text>
                        <Text style={styles.detailValue}>{orderDetails.paymentInfo.paymentMethod || '—'}</Text>
                      </View>
                    )}
                    {orderDetails?.paymentInfo?.utrNum && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>UTR Number:</Text>
                        <Text style={styles.detailValue}>{orderDetails.paymentInfo.utrNum}</Text>
                      </View>
                    )}
                    {orderDetails?.paymentInfo?.transactionId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID:</Text>
                        <Text style={styles.detailValue}>{orderDetails.paymentInfo.transactionId}</Text>
                      </View>
                    )}
                  </View>

                  {/* PDF: only one at a time. Order Accepted = Quote only. Confirmed/payment = Sales Order only. Delivery = Invoice + E-way only. */}
                  {selectedOrder && (() => {
                    const leadId = selectedOrder.leadId || selectedOrder.id;
                    const status = selectedOrder.status;
                    const showQuoteOnly = status === 'vendor_accepted';
                    const showSalesOrderOnly = ['order_confirmed', 'payment_done', 'truck_loading', 'shipped'].includes(status);
                    const showInvoiceEwayOnly = ['in_transit', 'out_for_delivery', 'delivered'].includes(status);
                    const loadingPdf = pdfLoading;
                    return (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Documents</Text>
                        <View style={styles.changeActions}>
                          {showQuoteOnly && (
                            <TouchableOpacity
                              style={styles.changeButton}
                              disabled={!!loadingPdf}
                              onPress={() => handlePdf(leadId, 'quote', 'Quote', status)}
                            >
                              <Icon name="file-text" size={16} color="#723FED" />
                              <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-quote` ? '...' : 'Quote'}</Text>
                            </TouchableOpacity>
                          )}
                          {showSalesOrderOnly && (
                            <TouchableOpacity
                              style={styles.changeButton}
                              disabled={!!loadingPdf}
                              onPress={() => handlePdf(leadId, 'sales-order', 'Sales Order', status)}
                            >
                              <Icon name="file-text" size={16} color="#723FED" />
                              <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-sales-order` ? '...' : 'Sales Order'}</Text>
                            </TouchableOpacity>
                          )}
                          {showInvoiceEwayOnly && (
                            <>
                              <TouchableOpacity
                                style={styles.changeButton}
                                disabled={!!loadingPdf}
                                onPress={() => handlePdf(leadId, 'invoice', 'Invoice', status)}
                              >
                                <Icon name="file-text" size={16} color="#723FED" />
                                <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-invoice` ? '...' : 'Invoice'}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.changeButton}
                                disabled={!!loadingPdf}
                                onPress={() => handlePdf(leadId, 'ewaybill', 'E-way Bill', status)}
                              >
                                <Icon name="file-text" size={16} color="#723FED" />
                                <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-ewaybill` ? '...' : 'E-way Bill'}</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })()}
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
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={styles.trackingStatusLabel}>ORDER TRACKING</Text>
                {trackingData?.currentStatus && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusConfig(trackingData.currentStatus.status).color, marginTop: spacing.xs }]}>
                    <Text style={styles.statusText}>{formatStatusLabel(trackingData.currentStatus.statusLabel)}</Text>
                  </View>
                )}
                {trackingData?.currentStatus?.statusDescription && (
                  <Text style={styles.trackingDescription}>
                    {trackingData.currentStatus.statusDescription}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                <TouchableOpacity 
                  onPress={async () => {
                    if (selectedOrder) {
                      setTrackingLoading(true);
                      try {
                        const leadId = selectedOrder.leadId || selectedOrder.id;
                        const result = await orderService.getOrderTracking(leadId);
                        if (result.success && result.data) {
                          setTrackingData(result.data);
                        }
                      } catch (error) {
                        console.error('Error refreshing tracking:', error);
                      } finally {
                        setTrackingLoading(false);
                      }
                    }
                  }}
                  style={styles.refreshButton}
                >
                  <Icon name="refresh-cw" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTrackingModal(false)}>
                  <Icon name="x" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.trackingBodyContainer}>
              {trackingLoading ? (
                <View style={styles.trackingLoadingContainer}>
                  <ActivityIndicator size="large" color="#723FED" />
                  <Text style={styles.loadingText}>Loading tracking information...</Text>
                </View>
              ) : trackingData ? (
                <ScrollView 
                  showsVerticalScrollIndicator={true} 
                  style={styles.trackingScrollView}
                  contentContainerStyle={styles.trackingScrollContent}
                  nestedScrollEnabled={true}
                >
                  <View style={styles.trackingContent}>
                  {/* Debug: Log tracking data */}
                  {console.log('🎨 Rendering tracking modal with data:', {
                    hasDelivery: !!trackingData.delivery,
                    deliveryKeys: trackingData.delivery ? Object.keys(trackingData.delivery) : [],
                    driverName: trackingData.delivery?.driverName,
                    fullDelivery: trackingData.delivery,
                    trackingDataKeys: Object.keys(trackingData),
                  })}
                  
                  {/* Delivery Information - Always show if delivery exists */}
                  {trackingData.delivery ? (
                    <View style={styles.trackingSection}>
                      <View style={styles.sectionHeader}>
                        <Icon name="truck" size={20} color="#3B82F6" />
                        <Text style={styles.sectionTitle}>Delivery Information</Text>
                      </View>
                      <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Status:</Text>
                          <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                            {trackingData.delivery.deliveryStatus?.replace('_', ' ') || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Driver Name:</Text>
                          <Text style={[styles.infoValue, !trackingData.delivery.driverName && styles.infoValueNA]}>
                            {trackingData.delivery.driverName || 'Not Assigned'}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Driver Phone:</Text>
                          {trackingData.delivery.driverPhone ? (
                            <TouchableOpacity onPress={() => {
                              Linking.openURL(`tel:${trackingData.delivery.driverPhone}`).catch(err => {
                                console.error('Error opening phone:', err);
                                Toast.show({
                                  type: 'error',
                                  text1: 'Error',
                                  text2: 'Unable to make phone call',
                                });
                              });
                            }}>
                              <Text style={[styles.infoValue, { color: '#3B82F6', textDecorationLine: 'underline' }]}>
                                {trackingData.delivery.driverPhone}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={[styles.infoValue, styles.infoValueNA]}>Not Available</Text>
                          )}
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Truck Number:</Text>
                          <Text style={[styles.infoValue, !trackingData.delivery.truckNumber && styles.infoValueNA]}>
                            {trackingData.delivery.truckNumber || 'Not Assigned'}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Vehicle Type:</Text>
                          <Text style={[styles.infoValue, !trackingData.delivery.vehicleType && styles.infoValueNA]}>
                            {trackingData.delivery.vehicleType || 'Not Assigned'}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Estimated Arrival:</Text>
                          <Text style={[styles.infoValue, !trackingData.delivery.estimatedArrival && styles.infoValueNA]}>
                            {trackingData.delivery.estimatedArrival 
                              ? new Date(trackingData.delivery.estimatedArrival).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                })
                              : 'Not Available'}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Delivery To:</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.infoValue}>
                              {trackingData.delivery.address || 'N/A'}
                            </Text>
                            {trackingData.delivery.pincode && (
                              <Text style={styles.infoValue}> ({trackingData.delivery.pincode})</Text>
                            )}
                          </View>
                        </View>
                        {trackingData.delivery.deliveryNotes && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Notes:</Text>
                            <Text style={styles.infoValue}>{trackingData.delivery.deliveryNotes}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.trackingSection}>
                      <View style={styles.sectionHeader}>
                        <Icon name="truck" size={20} color="#3B82F6" />
                        <Text style={styles.sectionTitle}>Delivery Information</Text>
                      </View>
                      <View style={styles.infoCard}>
                        <Text style={styles.infoValueNA}>Delivery information not available yet</Text>
                      </View>
                    </View>
                  )}

                  {/* Payment Information */}
                  {trackingData.payment && (
                    <View style={styles.trackingSection}>
                      <View style={styles.sectionHeader}>
                        <Icon name="credit-card" size={20} color="#10B981" />
                        <Text style={styles.sectionTitle}>Payment Information</Text>
                      </View>
                      <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Payment Status:</Text>
                          <Text style={[styles.infoValue, { 
                            color: trackingData.payment.paymentStatus === 'successful' ? '#10B981' : '#EF4444',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }]}>
                            {trackingData.payment.paymentStatus || 'Pending'}
                          </Text>
                        </View>
                        {trackingData.payment.paymentMethod && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Payment Method:</Text>
                            <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                              {trackingData.payment.paymentMethod.replace('_', ' ')}
                            </Text>
                          </View>
                        )}
                        {trackingData.payment.transactionId && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Transaction ID:</Text>
                            <Text style={styles.infoValue}>{trackingData.payment.transactionId}</Text>
                          </View>
                        )}
                        {trackingData.payment.paymentDate && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Payment Date:</Text>
                            <Text style={styles.infoValue}>
                              {new Date(trackingData.payment.paymentDate).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Vendor Information */}
                  {trackingData.vendor && (
                    <View style={styles.trackingSection}>
                      <View style={styles.sectionHeader}>
                        <Icon name="user" size={20} color="#8B5CF6" />
                        <Text style={styles.sectionTitle}>Vendor Information</Text>
                      </View>
                      <View style={styles.infoCard}>
                        {trackingData.vendor.name && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Vendor Name:</Text>
                            <Text style={styles.infoValue}>{trackingData.vendor.name}</Text>
                          </View>
                        )}
                        {trackingData.vendor.companyName && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Company Name:</Text>
                            <Text style={styles.infoValue}>{trackingData.vendor.companyName}</Text>
                          </View>
                        )}
                        {trackingData.vendor.phone && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone:</Text>
                            <TouchableOpacity onPress={() => {
                              Linking.openURL(`tel:${trackingData.vendor.phone}`).catch(err => {
                                console.error('Error opening phone:', err);
                                Toast.show({
                                  type: 'error',
                                  text1: 'Error',
                                  text2: 'Unable to make phone call',
                                });
                              });
                            }}>
                              <Text style={[styles.infoValue, { color: '#3B82F6', textDecorationLine: 'underline' }]}>
                                {trackingData.vendor.phone}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {trackingData.vendor.email && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{trackingData.vendor.email}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Status Timeline */}
                  {trackingData.statusTimeline && trackingData.statusTimeline.length > 0 && (() => {
                    // Deduplicate timeline: keep only the latest occurrence of each status
                    // Also normalize status labels for comparison (e.g., "Order Placed" vs "order_placed")
                    const normalizeStatusLabel = (label) => {
                      if (!label) return '';
                      return label.toLowerCase().replace(/\s+/g, '_').trim();
                    };
                    
                    const deduplicatedTimeline = trackingData.statusTimeline.reduce((acc, item) => {
                      // Normalize both status and statusLabel for comparison
                      const itemStatus = item.status?.toLowerCase() || '';
                      const itemLabel = normalizeStatusLabel(item.statusLabel);
                      
                      // Check if we already have this status (by status value or normalized label)
                      const existingIndex = acc.findIndex(existing => {
                        const existingStatus = existing.status?.toLowerCase() || '';
                        const existingLabel = normalizeStatusLabel(existing.statusLabel);
                        
                        // Match by status value OR by normalized label
                        return existingStatus === itemStatus || 
                               (existingLabel && itemLabel && existingLabel === itemLabel);
                      });
                      
                      if (existingIndex === -1) {
                        // Status doesn't exist, add it
                        acc.push(item);
                      } else {
                        // Status exists, compare dates and keep the latest one
                        const existingDate = new Date(acc[existingIndex].date);
                        const currentDate = new Date(item.date);
                        if (currentDate > existingDate) {
                          // Replace with newer one
                          acc[existingIndex] = item;
                        }
                      }
                      return acc;
                    }, []);
                    
                    // Sort by date (newest first)
                    deduplicatedTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    return (
                      <View style={styles.trackingSection}>
                        <View style={styles.sectionHeader}>
                          <Icon name="clock" size={20} color="#F59E0B" />
                          <Text style={styles.sectionTitle}>Status Timeline</Text>
                        </View>
                        <View style={styles.timelineContainer}>
                          {deduplicatedTimeline.map((timelineItem, index) => {
                            const isFirst = index === 0;
                            const isLast = index === deduplicatedTimeline.length - 1;
                            const statusConfig = getStatusConfig(timelineItem.status);
                          
                          return (
                            <View key={index} style={styles.timelineItem}>
                              <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot, { backgroundColor: isFirst ? statusConfig.color : '#9CA3AF' }]}>
                                  {isFirst && <Icon name="check" size={12} color="#FFFFFF" />}
                                </View>
                                {!isLast && <View style={styles.timelineLine} />}
                              </View>
                              <View style={styles.timelineContent}>
                                <View style={styles.timelineCard}>
                                  <View style={styles.timelineHeader}>
                                    <Text style={styles.timelineLabel}>{formatStatusLabel(timelineItem.statusLabel)}</Text>
                                    <Text style={styles.timelineDate}>
                                      {new Date(timelineItem.date).toLocaleString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                      })}
                                    </Text>
                                  </View>
                                  {timelineItem.remarks && (
                                    <Text style={styles.timelineRemarks}>{timelineItem.remarks}</Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    );
                  })()}
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.trackingLoadingContainer}>
                  <Text style={styles.loadingText}>No tracking information available</Text>
                </View>
              )}
            </View>
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

      <CustomerCareFooter />
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
    color: '#1F2937', // Explicit dark text color
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
    backgroundColor: '#FFFFFF', // Explicit white background
    borderWidth: 1,
    borderColor: '#E5E7EB', // Explicit light gray border
    marginRight: spacing.sm,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#723FED', // Explicit purple background
    borderColor: '#723FED', // Explicit purple border
  },
  filterChipText: {
    fontSize: 13,
    color: '#1F2937', // Explicit dark text color for visibility
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF', // Explicit white text for active state
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
    color: '#1F2937', // Explicit dark text color
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
    color: '#FFFFFF', // Explicit white text for status badges
  },
  statusTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF', // Explicit white text for status badges
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
    color: '#FFFFFF', // Explicit white text for visibility
    fontSize: 12,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: spacing.sm,
  },
  itemsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // Explicit dark text color
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
    color: '#1F2937', // Explicit dark text color
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
    color: '#1F2937', // Explicit dark text color
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937', // Explicit dark text color
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
    backgroundColor: 'transparent',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#723FED', // Explicit purple color for visibility
  },
  trackButton: {
    backgroundColor: '#10B981', // Explicit green background
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trackButtonText: {
    color: '#FFFFFF', // Explicit white text for contrast
    fontSize: 14,
    fontWeight: '600',
  },
  rateButton: {
    backgroundColor: '#FFFFFF', // Explicit white background
    borderWidth: 1,
    borderColor: '#723FED', // Explicit purple border
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rateButtonText: {
    color: '#723FED', // Explicit purple text for visibility
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceButton: {
    backgroundColor: '#FFFFFF', // Explicit white background
    borderWidth: 1,
    borderColor: '#723FED', // Explicit purple border
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  invoiceButtonText: {
    color: '#723FED', // Explicit purple text for visibility
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
    color: colors.textPrimary,
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
    maxHeight: '92%',
    minHeight: '80%',
    flexDirection: 'column',
    overflow: 'hidden',
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
    color: colors.textPrimary,
  },
  paymentDetails: {
    alignItems: 'center',
  },
  paymentOrderId: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
  },
  detailValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detailText: {
    fontSize: 14,
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
  // trackingBodyContainer
  // },
  // trackingScrollView: {
  // },
  trackingScrollContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  trackingLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingVertical: spacing.xl,
  },
  trackingSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  infoValueNA: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  timelineContainer: {
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 30,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
    backgroundColor: '#E5E7EB',
    marginTop: spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  timelineCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  timelineRemarks: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  refreshButton: {
    padding: spacing.xs,
  },
});

export default OrdersScreen;