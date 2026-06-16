import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, RefreshControl, Image, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { spacing, borderRadius, shadows } from '../../assets/styles/global';
import { useTheme } from '../../context/ThemeContext';
import { orderService } from '../../services/api/orderService';
import { getAccessToken } from '../../services/auth/tokenManager';
import { getStatusConfig, isTrackableStatus, shouldShowPayNow } from '../../utils/orderStatus';
import { downloadAndOpenPdf } from '../../utils/pdfDownload';
import OrderTimeline from '../../components/orders/OrderTimeline';
import ChangeAddressModal from '../../components/orders/ChangeAddressModal';
import ChangeDateModal from '../../components/orders/ChangeDateModal';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';
import { useTranslation } from 'react-i18next';
import Skeleton from '../../components/common/Skeleton';

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

const OrdersScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
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
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderService.getAllOrders({
        page: 1,
        limit: 100, // Fetch more for client-side filtering
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
    fetchOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // Client-side filtering to handle status overrides (e.g. confirmed + pending payment -> under verification)
  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      if (selectedStatus === 'all') return true;

      const rawStatus = (order.status || '').toLowerCase();
      const paymentStatus = (order.paymentStatus || 'pending').toLowerCase();

      let logicalStatus = rawStatus;

      // Strict override logic consistent with orderStatus.js getStatusConfig
      if (paymentStatus === 'successful' && !['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(rawStatus)) {
        logicalStatus = 'order_confirmed';
      } else if ((rawStatus === 'order_confirmed' || rawStatus === 'vendor_accepted' || rawStatus === 'payment_done') &&
        paymentStatus !== 'pending' &&
        paymentStatus !== 'successful') {
        logicalStatus = 'payment_done';
      }

      return logicalStatus === selectedStatus;
    });
  }, [orders, selectedStatus]);

  // Handle refresh and messages from other screens (e.g., PaymentScreen)
  useEffect(() => {
    if (route?.params?.refresh) {
      fetchOrders();
    }
    if (route?.params?.message) {
      Toast.show({
        type: 'success',
        text1: t('Success'),
        text2: route.params.message,
      });
      // Clear params to avoid repeating toast on re-renders
      navigation.setParams({ refresh: undefined, message: undefined });
    }
  }, [route?.params]);

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
      const result = await orderService.getOrderTracking(leadId);

      if (result.success && result.data) {
        setTrackingData(result.data);
      } else {
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
        text1: t('Error'),
        text2: t('Unable to load tracking information. Please try again.'),
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  const handlePayment = (order) => {
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
          text1: t('Downloaded'),
          text2: result.opened === false ? t('Saved to Downloads. Open from File Manager.') : t('Opened.'),
        });
      } else if (type === 'quote') {
        const isPlacedOrPending = !orderStatus || orderStatus === 'order_placed' || orderStatus === 'pending';
        const message = isPlacedOrPending
          ? t('Quote is generated when the order is confirmed.')
          : (result.apiMessage || result.error || t('Quote not available; try again in a moment.'));
        Toast.show({ type: 'info', text1: t('Quote'), text2: message });
      } else {
        Toast.show({ type: 'error', text1: t('Download failed'), text2: result.error || result.apiMessage || t('Try again') });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: t('Error'), text2: e?.message || t('Download failed') });
    } finally {
      setPdfLoading(null);
    }
  };

  const renderOrderCard = (order) => {
    const statusConfig = getStatusConfig(order.status, order.paymentStatus);
    const showPayNowBtn = shouldShowPayNow(order.status, order.paymentStatus);
    const isTrackable = isTrackableStatus(order.status, order.paymentStatus);
    const firstItem = order.items?.[0];
    const moreItemsCount = order.items?.length > 1 ? order.items.length - 1 : 0;
    const sharedGradient = colors.ordersGradient || ['#7C3AED', '#0891B2'];

    return (
      <View key={order.id} style={styles.orderShadowWrapper}>
        <LinearGradient
          colors={sharedGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.orderBorderGradient}
        >
          <View style={styles.orderCard}>
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
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text style={styles.orderId} numberOfLines={2}>Order #{order.orderNumber || order.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusBadge,
                  { maxWidth: '50%' },
                  !statusConfig.isGradient && { backgroundColor: statusConfig.color },
                  statusConfig.isGradient && { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden' }
                ]}
                onPress={() => isTrackable && handleTrackOrder(order)}
              >
                {statusConfig.isGradient && (
                  <LinearGradient
                    colors={statusConfig.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.statusText, statusConfig.isGradient && { paddingHorizontal: spacing.sm, paddingVertical: 6 }]}>
                  {t(statusConfig.label)}
                </Text>
              </TouchableOpacity>
            </View>

            {showPayNowBtn && (
              <View style={styles.paymentAlert}>
                <Icon name="alert-circle" size={18} color="#3B82F6" />
                <Text style={styles.paymentAlertText}>{t('Payment Pending')}</Text>
                <TouchableOpacity
                  style={styles.payNowButtonSmall}
                  onPress={() => handlePayment(order)}
                >
                  <Text style={styles.payNowButtonSmallText}>{t('Pay Now')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {firstItem && (
              <View style={styles.itemsSection}>
                <Text style={styles.itemsSectionTitle}>{t('Items')}</Text>
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
                      {t('Qty:')} {firstItem.quantity}
                    </Text>
                  </View>
                </View>
                {moreItemsCount > 0 && (
                  <Text style={styles.moreItemsText}>{moreItemsCount > 1 ? t('+{{count}} more items', { count: moreItemsCount }) : t('+{{count}} more item', { count: moreItemsCount })}</Text>
                )}
              </View>
            )}

            <View style={styles.orderActions}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewOrder(order)}
              >
                <Text style={styles.viewButtonText}>{t('View')}</Text>
              </TouchableOpacity>

              {isTrackable && (
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => handleTrackOrder(order)}
                >
                  <Icon name="map-pin" size={16} color="#FFFFFF" />
                  <Text style={styles.trackButtonText}>{t('Track')}</Text>
                </TouchableOpacity>
              )}

              {['delivered'].includes(order.status?.toLowerCase()) && (
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => Toast.show({
                    type: 'info',
                    text1: t('Rate Order'),
                    text2: t('Rating feature coming soon'),
                  })}
                >
                  <Icon name="star" size={16} color="#723FED" />
                  <Text style={styles.rateButtonText}>{t('Rate')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const statusFilters = [
    { key: 'all', label: t('All Orders') },
    { key: 'order_placed', label: t('Enquiry Submitted') },
    { key: 'vendor_accepted', label: t('Order Accepted') },
    { key: 'payment_done', label: t('Payment Under Verification') },
    { key: 'order_confirmed', label: t('Order Confirmed') },
    { key: 'truck_loading', label: t('Loading') },
    { key: 'shipped', label: t('Dispatched') },
    { key: 'in_transit', label: t('On the Way') },
    { key: 'out_for_delivery', label: t('Out for Delivery') },
    { key: 'delivered', label: t('Delivered') },
    { key: 'cancelled', label: t('Cancelled') },
  ];

  const renderOrdersSkeleton = () => {
    const skeletonItems = [1, 2, 3];
    return (
      <View style={styles.ordersContainer}>
        {skeletonItems.map((item) => (
          <View key={item} style={styles.skeletonCard}>
            <View style={styles.orderHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="60%" height={18} borderRadius={4} style={{ marginBottom: 6 }} />
                  <Skeleton width="30%" height={14} borderRadius={4} />
                </View>
              </View>
              <Skeleton width={80} height={28} borderRadius={14} />
            </View>
            <View style={{ marginTop: 16 }}>
              <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 16 }} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Skeleton width="48%" height={40} borderRadius={8} />
                <Skeleton width="48%" height={40} borderRadius={8} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.filterContainer}>
            <Skeleton width="100%" height={40} borderRadius={20} style={{ marginHorizontal: spacing.md }} />
          </View>
          {renderOrdersSkeleton()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            colors={['#723FED']}
          />
        }
      >
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
                selectedStatus === filter.key ? styles.filterChipActive : styles.filterChipUnselected,
              ]}
              onPress={() => setSelectedStatus(filter.key)}
            >
              {selectedStatus === filter.key && (
                <LinearGradient
                  colors={colors.ordersGradient || ['#7C3AED', '#0891B2']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                />
              )}
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

        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="package" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>{t('No Orders Found')}</Text>
              <Text style={styles.emptyStateText}>
                {t('Your orders will appear here once you place them')}
              </Text>
            </View>
          ) : (
            filteredOrders.map(renderOrderCard)
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showOrderDetailsModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setShowOrderDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Order Details')}</Text>
              <TouchableOpacity onPress={() => setShowOrderDetailsModal(false)}>
                <Icon name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {orderDetailsLoading ? (
              <View style={styles.skeletonModalContent}>
                <Skeleton width="100%" height={120} borderRadius={12} style={{ marginBottom: 20 }} />
                <Skeleton width="40%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height={100} borderRadius={12} style={{ marginBottom: 20 }} />
                <Skeleton width="40%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height={150} borderRadius={12} />
              </View>
            ) : selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.orderDetailsContent}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>{t('Order Information')}</Text>
                    <LinearGradient
                      colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.detailSectionGradient}
                    >
                      <View style={styles.detailTile}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{t('Order Number:')}</Text>
                          <Text style={styles.detailValue}>{selectedOrder.orderNumber || selectedOrder.id}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{t('Order Date:')}</Text>
                          <Text style={styles.detailValue}>{formatDate(selectedOrder.orderDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{t('Status:')}</Text>
                          {(() => {
                            const sConf = getStatusConfig(selectedOrder.status, selectedOrder.paymentStatus);
                            return (
                              <View style={[
                                styles.statusBadgeSmall,
                                !sConf.isGradient && { backgroundColor: sConf.color },
                                sConf.isGradient && { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden' }
                              ]}>
                                {sConf.isGradient && (
                                  <LinearGradient
                                    colors={sConf.gradientColors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={StyleSheet.absoluteFill}
                                  />
                                )}
                                <Text style={[styles.statusTextSmall, sConf.isGradient && { paddingHorizontal: spacing.xs, paddingVertical: 4 }]}>
                                  {t(sConf.label)}
                                </Text>
                              </View>
                            );
                          })()}
                        </View>
                        {selectedOrder && selectedOrder.status && !['pending', 'order_placed'].includes(selectedOrder.status.toLowerCase()) ? (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('Total Amount:')}</Text>
                            <Text style={[styles.detailValue, { fontWeight: 'bold' }]}>
                              ₹{(selectedOrder.totalAmount || 0).toFixed(2)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>{t('Order Items')}</Text>
                    <LinearGradient
                      colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.detailSectionGradient}
                    >
                      <View style={styles.detailTile}>
                        {selectedOrder.items?.map((item, index) => (
                          <View key={index} style={styles.detailItemRow}>
                            {item.image && (
                              <Image source={{ uri: item.image }} style={styles.detailItemImage} />
                            )}
                            <View style={styles.detailItemInfo}>
                              <Text style={styles.detailItemName}>{item.name}</Text>
                              <Text style={styles.detailItemText}>{t('Qty:')} {item.quantity}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  </View>

                  {selectedOrder && selectedOrder.status && [
                    'vendor_accepted',
                    'payment_done',
                    'order_confirmed',
                    'truck_loading',
                    'shipped',
                    'in_transit',
                    'out_for_delivery',
                    'delivered'
                  ].includes(selectedOrder.status.toLowerCase()) && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>{t('Payment Information')}</Text>
                        <LinearGradient
                          colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.detailSectionGradient}
                        >
                          <View style={styles.detailTile}>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>{t('Payment Status:')}</Text>
                              {(() => {
                                let rawStatus = orderDetails?.paymentInfo?.paymentStatus || orderDetails?.paymentStatus || selectedOrder?.paymentStatus || 'pending';
                                let paymentStatus = (rawStatus || '').toLowerCase();
                                const advancedStatuses = ['payment_done', 'order_confirmed', 'truck_loading', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
                                if (paymentStatus === 'pending' && advancedStatuses.includes((selectedOrder?.status || '').toLowerCase())) {
                                  if ((selectedOrder?.status || '').toLowerCase() === 'payment_done') {
                                    paymentStatus = 'under verification';
                                  } else {
                                    paymentStatus = 'successful';
                                  }
                                }
                                const isSuccessful = paymentStatus === 'successful';
                                const isUnderVerification = paymentStatus === 'under verification';
                                let color = '#EF4444'; 
                                if (isSuccessful) color = '#10B981'; 
                                else if (isUnderVerification) color = '#F59E0B'; 
                                const displayText = paymentStatus.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                return (
                                  <Text style={[styles.detailValue, { color, fontWeight: '600' }]}>
                                    {displayText}
                                  </Text>
                                );
                              })()}
                            </View>
                            {(() => {
                              let method = orderDetails?.paymentInfo?.paymentMethod || orderDetails?.paymentDetails?.paymentMethod || orderDetails?.paymentMethod || selectedOrder?.paymentMethod || orderDetails?.paymentType || selectedOrder?.paymentType;
                              const fallbackUtr = orderDetails?.paymentInfo?.utrNum || selectedOrder?.paymentInfo?.utrNum || orderDetails?.utrNum || selectedOrder?.utrNum;
                              if (!method && fallbackUtr) method = 'bank_transfer';
                              if (method) {
                                return (
                                  <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>{t('Payment Method:')}</Text>
                                    <Text style={styles.detailValue}>{method}</Text>
                                  </View>
                                );
                              }
                              return null;
                            })()}
                          </View>
                        </LinearGradient>
                      </View>
                    )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>{t('Delivery Information')}</Text>
                    <LinearGradient
                      colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.detailSectionGradient}
                    >
                      <View style={styles.detailTile}>
                        <Text style={styles.detailText}>{selectedOrder.deliveryAddress}</Text>
                        <Text style={styles.detailText}>{t('PIN:')} {selectedOrder.deliveryPincode}</Text>
                        <Text style={styles.detailText}>
                          {t('Expected Delivery:')} {formatDate(selectedOrder.deliveryExpectedDate)}
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
                                <Text style={styles.changeButtonText}>{t('Change Address')}</Text>
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
                                <Text style={styles.changeButtonText}>{t('Change Delivery Date')}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </View>

                  {selectedOrder && (() => {
                    const leadId = selectedOrder.leadId || selectedOrder.id;
                    const status = selectedOrder.status;
                    const showQuoteOnly = status === 'vendor_accepted';
                    const showSalesOrderOnly = ['order_confirmed', 'payment_done', 'truck_loading', 'shipped'].includes(status);
                    const showInvoiceEwayOnly = ['in_transit', 'out_for_delivery', 'delivered'].includes(status);
                    const loadingPdf = pdfLoading;
                    return (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>{t('Documents')}</Text>
                        <LinearGradient
                          colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.detailSectionGradient}
                        >
                          <View style={styles.detailTile}>
                            <View style={styles.changeActions}>
                              {showQuoteOnly && (
                                <TouchableOpacity
                                  style={styles.changeButton}
                                  disabled={!!loadingPdf}
                                  onPress={() => handlePdf(leadId, 'quote', t('Quote'), status)}
                                >
                                  <Icon name="file-text" size={16} color="#723FED" />
                                  <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-quote` ? '...' : t('Quote')}</Text>
                                </TouchableOpacity>
                              )}
                              {showSalesOrderOnly && (
                                <TouchableOpacity
                                  style={styles.changeButton}
                                  disabled={!!loadingPdf}
                                  onPress={() => handlePdf(leadId, 'sales-order', t('Sales Order'), status)}
                                >
                                  <Icon name="file-text" size={16} color="#723FED" />
                                  <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-sales-order` ? '...' : t('Sales Order')}</Text>
                                </TouchableOpacity>
                              )}
                              {showInvoiceEwayOnly && (
                                <>
                                  <TouchableOpacity
                                    style={styles.changeButton}
                                    disabled={!!loadingPdf}
                                    onPress={() => handlePdf(leadId, 'invoice', t('Invoice'), status)}
                                  >
                                    <Icon name="file-text" size={16} color="#723FED" />
                                    <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-invoice` ? '...' : t('Invoice')}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.changeButton}
                                    disabled={!!loadingPdf}
                                    onPress={() => handlePdf(leadId, 'ewaybill', t('E-way Bill'), status)}
                                  >
                                    <Icon name="file-text" size={16} color="#723FED" />
                                    <Text style={styles.changeButtonText}>{loadingPdf === `${leadId}-ewaybill` ? '...' : t('E-way Bill')}</Text>
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    );
                  })()}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTrackingModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setShowTrackingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={styles.trackingStatusLabel}>{t('ORDER TRACKING')}</Text>
                {trackingData?.currentStatus && (() => {
                  const sConf = getStatusConfig(trackingData.currentStatus.status);
                  return (
                    <View style={[
                      styles.statusBadge,
                      !sConf.isGradient && { backgroundColor: sConf.color },
                      { marginTop: spacing.xs },
                      sConf.isGradient && { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden' }
                    ]}>
                      {sConf.isGradient && (
                        <LinearGradient
                          colors={sConf.gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <Text style={[styles.statusText, sConf.isGradient && { paddingHorizontal: spacing.sm, paddingVertical: 6 }]}>
                        {t(formatStatusLabel(trackingData.currentStatus.statusLabel))}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => handleTrackOrder(selectedOrder)}
                  style={styles.refreshButton}
                >
                  <Icon name="refresh-cw" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTrackingModal(false)}>
                  <Icon name="x" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {trackingLoading ? (
              <View style={styles.skeletonModalContent}>
                <Skeleton width="100%" height={150} borderRadius={12} style={{ marginBottom: 20 }} />
                <Skeleton width="40%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
                {[1, 2, 3].map(i => (
                  <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <Skeleton width={20} height={20} borderRadius={10} />
                    <Skeleton width="80%" height={60} borderRadius={8} />
                  </View>
                ))}
              </View>
            ) : trackingData && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.trackingScrollContent}>
                <View style={styles.trackingContent}>
                  {trackingData.delivery && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>{t('Delivery Information')}</Text>
                      <LinearGradient
                        colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.detailSectionGradient}
                      >
                        <View style={styles.detailTile}>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Driver:')}</Text>
                            <Text style={styles.infoValue}>{trackingData.delivery.driverName || '—'}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Vehicle:')}</Text>
                            <Text style={styles.infoValue}>{trackingData.delivery.truckNumber || '—'}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Estimated:')}</Text>
                            <Text style={styles.infoValue}>{formatDate(trackingData.delivery.estimatedArrival)}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  )}

                  {trackingData.vendor && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>{t('Vendor Details')}</Text>
                      <LinearGradient
                        colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.detailSectionGradient}
                      >
                        <View style={styles.infoCard}>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Vendor Name:')}</Text>
                            <Text style={styles.infoValue}>{trackingData.vendor.name || '—'}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('Company:')}</Text>
                            <Text style={styles.infoValue}>{trackingData.vendor.companyName || '—'}</Text>
                          </View>
                          {trackingData.vendor.phone && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>{t('Phone:')}</Text>
                              <TouchableOpacity onPress={() => Linking.openURL(`tel:${trackingData.vendor.phone}`)}>
                                <Text style={[styles.infoValue, { color: colors.primary }]}>{trackingData.vendor.phone}</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  )}

                  {trackingData.statusTimeline && trackingData.statusTimeline.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>{t('Status Timeline')}</Text>
                      <View style={styles.timelineContainer}>
                        {trackingData.statusTimeline.map((item, index) => {
                          const sConf = getStatusConfig(item.status);
                          const isLast = index === trackingData.statusTimeline.length - 1;
                          return (
                            <View key={index} style={styles.timelineItem}>
                              <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot, { borderColor: sConf.color || colors.primary }]} />
                                {!isLast && <View style={styles.timelineLine} />}
                              </View>
                              <View style={styles.timelineContent}>
                                <LinearGradient
                                  colors={colors.ordersGradient || ['#5B21B6', '#0F766E']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={{ borderRadius: borderRadius.xl, padding: 1.2 }}
                                >
                                  <View style={styles.timelineCard}>
                                    <View style={styles.timelineHeader}>
                                      <Text style={styles.timelineLabel}>{t(formatStatusLabel(item.statusLabel))}</Text>
                                      <Text style={styles.timelineDate}>{formatDate(item.date)}</Text>
                                    </View>
                                    {item.remarks && <Text style={styles.timelineRemarks}>{item.remarks}</Text>}
                                  </View>
                                </LinearGradient>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <ChangeAddressModal
        visible={showChangeAddressModal}
        onClose={() => {
          setShowChangeAddressModal(false);
          setShowOrderDetailsModal(true);
        }}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />

      <ChangeDateModal
        visible={showChangeDateModal}
        onClose={() => {
          setShowChangeDateModal(false);
          setShowOrderDetailsModal(true);
        }}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />

      <CustomerCareFooter />
    </View>
  );
};

const createStyles = (colors, isDarkMode) => {
  const highlightColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF';
  const neumorphShadow = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.12)';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 0,
    },
    content: {
      flex: 1,
      paddingTop: 110, // Increased clearance for absolute header
      paddingBottom: 180, // Significant clearance for floating navigations
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: 14,
      color: colors.textSecondary,
    },
    filterContainer: {
      backgroundColor: colors.background,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      maxHeight: 70,
      marginBottom: spacing.md, // Added space between filter pills and orders
    },
    filterContent: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.card,
      marginHorizontal: 4,
      minWidth: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterChipActive: {
      backgroundColor: 'transparent',
    },
    filterChipUnselected: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
    },
    ordersContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: 180, // Significant clearance for floating nav + FABs
    },
    orderShadowWrapper: {
      marginBottom: spacing.lg,
      borderRadius: borderRadius.xl,
      ...shadows.cloud,
    },
    orderBorderGradient: {
      padding: 1.5,
      borderRadius: borderRadius.xl,
    },
    orderCard: {
      backgroundColor: isDarkMode ? colors.card : colors.white,
      borderRadius: borderRadius.xl - 1.5,
      padding: spacing.lg,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.lg,
    },
    orderHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.md,
    },
    orderIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
      fontWeight: '700',
      color: colors.textPrimary,
    },
    orderDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    statusBadgeSmall: {
      borderRadius: 20, // Pill shape
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },
    statusTextSmall: {
      fontSize: 9,
      fontWeight: '800',
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },
    paymentAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardLight,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    paymentAlertText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    payNowButtonSmall: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: borderRadius.full,
    },
    payNowButtonSmallText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    itemsSection: {
      marginBottom: spacing.lg,
    },
    itemsSectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
    itemRow: {
      flexDirection: 'row',
      gap: spacing.md,
      backgroundColor: colors.cardLight,
      padding: spacing.sm,
      borderRadius: borderRadius.lg,
    },
    itemImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.md,
    },
    itemInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    itemName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    itemDetails: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    moreItemsText: {
      fontSize: 11,
      color: colors.primary,
      marginTop: spacing.xs,
      fontWeight: '700',
    },
    orderActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    viewButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.cardLight,
    },
    viewButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
      textTransform: 'uppercase',
    },
    trackButton: {
      backgroundColor: colors.success,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      flexDirection: 'row',
      gap: spacing.xs,
      alignItems: 'center',
    },
    trackButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    rateButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.cardLight,
      flexDirection: 'row',
      gap: spacing.xs,
      alignItems: 'center',
    },
    rateButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: spacing.md,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContentLarge: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '90%',
      padding: spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    orderDetailsContent: {
      paddingBottom: 100, // Clearance for modal bottom edge
    },
    detailSection: {
      marginBottom: spacing.xl,
    },
    detailSectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    detailSectionGradient: {
      padding: 1.5,
      borderRadius: borderRadius.xl,
      marginBottom: spacing.md,
    },
    detailTile: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl - 1.5,
      padding: spacing.lg,
      ...shadows.cloud,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    detailLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    detailValueBold: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    detailText: {
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    detailItemRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    detailItemImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.md,
      backgroundColor: colors.backgroundLight,
    },
    detailItemInfo: {
      flex: 1,
    },
    detailItemName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    detailItemText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    changeActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    changeButton: {
      backgroundColor: colors.cardLight,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      flexDirection: 'row',
      gap: spacing.xs,
      alignItems: 'center',
    },
    changeButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    trackingStatusLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    trackingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    trackingScrollContent: {
      paddingBottom: 100, // Clearance for modal bottom edge
    },
    trackingContent: {
      marginTop: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    infoValue: {
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    infoValueNA: {
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl - 1.5,
      padding: spacing.lg,
      ...shadows.cloud,
    },
    timelineContainer: {
      paddingLeft: spacing.xs,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    timelineLeft: {
      alignItems: 'center',
      marginRight: spacing.md,
      width: 20,
    },
    timelineDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 3,
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: colors.borderLight,
      minHeight: 30,
    },
    timelineContent: {
      flex: 1,
    },
    timelineCard: {
      backgroundColor: colors.cardLight,
      borderRadius: borderRadius.xl - 1.5,
      padding: spacing.lg,
    },
    timelineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    timelineLabel: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    timelineDate: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    timelineRemarks: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    refreshButton: {
      padding: 8,
    },
  });
};

export default OrdersScreen;
