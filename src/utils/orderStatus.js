/**
 * Order Status Utilities
 * Maps API statuses to UI-friendly labels, colors, and descriptions
 */

export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'In Cart',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    description: 'Item in cart, ready to place order',
    showToCustomer: false,
    trackable: false,
    showPayNow: false,
  },
  order_placed: {
    label: 'Order Placed',
    color: '#F97316',
    backgroundColor: '#FFEDD5',
    description: 'Order placed, awaiting vendor confirmation',
    trackable: false,
    showPayNow: false,
  },
  vendor_accepted: {
    label: 'Order Accepted',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    description: 'Order accepted - Payment required',
    trackable: false,
    showPayNow: true,
  },
  payment_done: {
    label: 'Payment Completed',
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    description: 'Payment processed successfully',
    trackable: false,
    showPayNow: false,
  },
  order_confirmed: {
    label: 'Order Confirmed',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    description: 'Your order is confirmed and being prepared for dispatch',
    trackable: true,
    showPayNow: false,
  },
  truck_loading: {
    label: 'Loading',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    description: 'Your order is being loaded onto delivery vehicle',
    trackable: true,
    showPayNow: false,
  },
  shipped: {
    label: 'Dispatched',
    color: '#6366F1',
    backgroundColor: '#E0E7FF',
    description: 'Order dispatched from warehouse',
    trackable: true,
    showPayNow: false,
  },
  in_transit: {
    label: 'On the Way',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    description: 'Order is in transit to your location',
    trackable: true,
    showPayNow: false,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    description: 'Order is out for delivery today',
    trackable: true,
    showPayNow: false,
  },
  delivered: {
    label: 'Delivered',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    description: 'Order has been delivered successfully',
    trackable: true,
    showPayNow: false,
    showRateButton: true,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    description: 'Order has been cancelled',
    trackable: false,
    showPayNow: false,
  },
};

/**
 * Get status configuration for a given status
 */
export const getStatusConfig = (status) => {
  const normalizedStatus = (status || '').toLowerCase();
  return ORDER_STATUS_CONFIG[normalizedStatus] || {
    label: status || 'Unknown',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    description: 'Status unknown',
    trackable: false,
    showPayNow: false,
  };
};

/**
 * Check if status is trackable
 */
export const isTrackableStatus = (status) => {
  const config = getStatusConfig(status);
  return config.trackable;
};

/**
 * Check if order should show Pay Now button
 */
export const shouldShowPayNow = (status, paymentStatus) => {
  const config = getStatusConfig(status);
  return config.showPayNow || (status === 'vendor_accepted' && paymentStatus === 'pending');
};

/**
 * Get trackable statuses list
 */
export const TRACKABLE_STATUSES = [
  'order_confirmed',
  'truck_loading',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

/**
 * Order status flow for timeline
 */
export const STATUS_FLOW = [
  { status: 'order_placed', label: 'Order Placed', icon: 'package' },
  { status: 'vendor_accepted', label: 'Vendor Verifying', icon: 'search' },
  { status: 'vendor_accepted', label: 'Order Accepted', icon: 'check-circle' },
  { status: 'vendor_accepted', label: 'Payment Required', icon: 'credit-card' },
  { status: 'payment_done', label: 'Payment Done', icon: 'check-circle' },
  { status: 'order_confirmed', label: 'Order Confirmed', icon: 'check-circle' },
  { status: 'shipped', label: 'Shipped', icon: 'package' },
  { status: 'in_transit', label: 'In Transit', icon: 'truck' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: 'truck' },
  { status: 'delivered', label: 'Delivered', icon: 'check-circle' },
];

