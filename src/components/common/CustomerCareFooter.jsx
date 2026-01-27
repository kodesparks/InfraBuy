import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
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
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientContainer}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="call" size={16} color={colors.white || '#FFFFFF'} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Customer Care</Text>
            <TouchableOpacity 
              onPress={handleCallPress}
              activeOpacity={0.7}
            >
              <Text style={styles.phoneNumber}>{CUSTOMER_CARE_NUMBER}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={handleCallPress}
            activeOpacity={0.8}
          >
            <Icon name="call-outline" size={16} color={colors.white || '#FFFFFF'} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0,
  },
  gradientContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: spacing.sm,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white || '#FFFFFF',
    marginLeft: 4,
  },
  phoneNumberContainer: {
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white || '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default CustomerCareFooter;

