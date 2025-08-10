import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../assets/styles/global';

const TrackingScreen = ({ navigation, route }) => {
  // Add safety checks for route and params
  if (!route || !route.params) {
    console.warn('TrackingScreen: No route or params found');
  }
  
  const { order } = route?.params || { order: { id: 'ORD001' } };
  const orderId = order?.id || 'ORD001';

  const trackingSteps = [
    {
      id: 1,
      title: 'Order Placed',
      description: 'Your order has been successfully placed',
      status: 'completed',
      time: '2024-01-15 10:30 AM',
    },
    {
      id: 2,
      title: 'Order Confirmed',
      description: 'Order has been confirmed and is being processed',
      status: 'completed',
      time: '2024-01-15 11:00 AM',
    },
    {
      id: 3,
      title: 'Out for Delivery',
      description: 'Your order is out for delivery',
      status: 'in-progress',
      time: '2024-01-15 02:00 PM',
    },
    {
      id: 4,
      title: 'Delivered',
      description: 'Order has been delivered successfully',
      status: 'pending',
      time: 'Expected: 2024-01-15 06:00 PM',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in-progress':
        return colors.primary;
      case 'pending':
        return colors.textLight;
      default:
        return colors.textLight;
    }
  };

  const renderTrackingStep = (step) => (
    <View key={step.id} style={styles.trackingStep}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, { backgroundColor: getStatusColor(step.status) }]} />
        {step.id < trackingSteps.length && (
          <View style={[styles.stepLine, { backgroundColor: getStatusColor(step.status) }]} />
        )}
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
        <Text style={styles.stepTime}>{step.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{orderId}</Text>
          <Text style={styles.orderStatus}>In Transit</Text>
        </View>

        <View style={styles.trackingContainer}>
          <Text style={styles.trackingTitle}>Order Status</Text>
          {trackingSteps.map(renderTrackingStep)}
        </View>
      </ScrollView>
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
  
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  orderInfo: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  orderStatus: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trackingContainer: {
    marginBottom: spacing.lg,
  },
  trackingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textLight,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.textLight,
    marginTop: spacing.xs,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stepTime: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default TrackingScreen;
