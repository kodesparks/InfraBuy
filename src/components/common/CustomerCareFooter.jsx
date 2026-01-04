import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';

const CUSTOMER_CARE_NUMBER = '9000390909';

const CustomerCareFooter = ({ style }) => {
  const handleCallPress = () => {
    Linking.openURL(`tel:${CUSTOMER_CARE_NUMBER}`).catch(err => {
      console.error('Error opening phone:', err);
    });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Icon name="phone" size={16} color={colors.primary} />
        <Text style={styles.label}>Customer Care:</Text>
        <TouchableOpacity onPress={handleCallPress}>
          <Text style={styles.phoneNumber}>{CUSTOMER_CARE_NUMBER}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  phoneNumber: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default CustomerCareFooter;

