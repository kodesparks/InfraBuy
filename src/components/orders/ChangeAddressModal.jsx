import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { orderService } from '../../services/api/orderService';

const ChangeAddressModal = ({ visible, onClose, order, onSuccess }) => {
  const [newAddress, setNewAddress] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!newAddress.trim()) {
      newErrors.newAddress = 'New address is required';
    } else if (newAddress.length < 10) {
      newErrors.newAddress = 'Address must be at least 10 characters';
    } else if (newAddress.length > 500) {
      newErrors.newAddress = 'Address must be less than 500 characters';
    }
    
    if (reason && reason.length > 200) {
      newErrors.reason = 'Reason must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!order?.id && !order?.leadId) {
      Alert.alert('Error', 'Invalid order information');
      return;
    }

    setLoading(true);
    try {
      const leadId = order.leadId || order.id;
      const result = await orderService.changeDeliveryAddress(leadId, {
        newAddress: newAddress.trim(),
        reason: reason.trim() || '',
      });

      if (result.success) {
        Alert.alert('Success', 'Delivery address updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              setNewAddress('');
              setReason('');
              setErrors({});
              onSuccess && onSuccess();
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error changing address:', error);
      Alert.alert('Error', 'Failed to update address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Change Delivery Address</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Address */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Address</Text>
              <View style={styles.currentInfoBox}>
                <Text style={styles.currentInfoText}>{order?.deliveryAddress || 'N/A'}</Text>
                <Text style={styles.currentInfoText}>PIN: {order?.deliveryPincode || 'N/A'}</Text>
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningBox}>
              <Icon name="alert-triangle" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Address changes are only allowed within 48 hours of order placement
              </Text>
            </View>

            {/* New Address Form */}
            <View style={styles.section}>
              <Text style={styles.label}>
                New Address <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textArea, errors.newAddress && styles.inputError]}
                value={newAddress}
                onChangeText={(text) => {
                  setNewAddress(text);
                  if (errors.newAddress) {
                    setErrors({ ...errors, newAddress: null });
                  }
                }}
                placeholder="Enter complete delivery address (10-500 characters)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
                onBlur={validateForm}
              />
              {errors.newAddress && (
                <Text style={styles.errorText}>{errors.newAddress}</Text>
              )}
            </View>

            {/* Reason */}
            <View style={styles.section}>
              <Text style={styles.label}>Reason (Optional)</Text>
              <TextInput
                style={[styles.textArea, errors.reason && styles.inputError]}
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  if (errors.reason) {
                    setErrors({ ...errors, reason: null });
                  }
                }}
                placeholder="Why are you changing the address? (max 200 characters)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              {errors.reason && (
                <Text style={styles.errorText}>{errors.reason}</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : ['#723FED', '#3B58EB']}
                  style={styles.updateButtonGradient}
                >
                  <Icon name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.updateButtonText}>
                    {loading ? 'Updating...' : 'Update Address'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  currentInfoBox: {
    backgroundColor: '#F3F4F6',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  currentInfoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: '#EF4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  updateButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangeAddressModal;

