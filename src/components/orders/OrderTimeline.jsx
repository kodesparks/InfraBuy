import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { getStatusConfig, STATUS_FLOW } from '../../utils/orderStatus';

const OrderTimeline = ({ currentStatus }) => {
  const { t } = useTranslation();
  const getStepStatus = (stepStatus, currentStatus) => {
    const statusFlow = [
      'order_placed',
      'vendor_accepted',
      'payment_done',
      'order_confirmed',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
    ];

    const currentIndex = statusFlow.indexOf(currentStatus);
    const stepIndex = statusFlow.indexOf(stepStatus);

    if (stepIndex === -1) return 'upcoming';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (stepStatus, stepStatusType) => {
    if (stepStatusType === 'completed') {
      return 'check-circle';
    }
    if (stepStatusType === 'current') {
      return 'circle';
    }
    return 'circle';
  };

  const getStepColor = (stepStatusType) => {
    switch (stepStatusType) {
      case 'completed':
        return '#10B981';
      case 'current':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  };

  const timelineSteps = [
    { status: 'order_placed', label: t('Order Placed'), description: t('Your order has been received and is being processed'), icon: 'package' },
    { status: 'vendor_accepted', label: t('Order Accepted'), description: t('Vendor has accepted your order'), icon: 'check-circle' },
    { status: 'payment_done', label: t('Payment Done'), description: t('Payment has been processed successfully'), icon: 'check-circle' },
    { status: 'order_confirmed', label: t('Order Confirmed'), description: t('Your order is confirmed and being prepared'), icon: 'check-circle' },
    { status: 'shipped', label: t('Shipped'), description: t('Your order has been shipped from warehouse'), icon: 'package' },
    { status: 'in_transit', label: t('In Transit'), description: t('Order is in transit to your location'), icon: 'truck' },
    { status: 'out_for_delivery', label: t('Out for Delivery'), description: t('Order is out for delivery today'), icon: 'truck' },
    { status: 'delivered', label: t('Delivered'), description: t('Order has been delivered successfully'), icon: 'check-circle' },
  ];

  return (
    <View style={styles.container}>
      {timelineSteps.map((step, index) => {
        const stepStatusType = getStepStatus(step.status, currentStatus);
        const stepColor = getStepColor(stepStatusType);
        const isLast = index === timelineSteps.length - 1;

        return (
          <View key={step.status} style={styles.stepContainer}>
            <View style={styles.stepLeft}>
              <View style={[styles.stepCircle, { backgroundColor: stepColor }]}>
                <Icon
                  name={getStepIcon(step.status, stepStatusType)}
                  size={20}
                  color={stepStatusType === 'completed' || stepStatusType === 'current' ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: stepStatusType === 'completed' ? '#10B981' : '#E5E7EB' },
                  ]}
                />
              )}
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <View style={[styles.stepBadge, { backgroundColor: stepColor === '#10B981' ? '#D1FAE5' : stepColor === '#3B82F6' ? '#DBEAFE' : '#F3F4F6' }]}>
                    <Text style={[styles.stepBadgeText, { color: stepColor }]}>
                      {stepStatusType === 'completed' ? t('Completed') : stepStatusType === 'current' ? t('Current') : t('Upcoming')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 40,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: spacing.xs,
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  stepCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  stepBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default OrderTimeline;



