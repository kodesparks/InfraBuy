import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { orderService } from '../../services/api/orderService';

const ChangeDateModal = ({ visible, onClose, order, onSuccess }) => {
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!newDate.trim()) {
      newErrors.newDate = 'Delivery date is required';
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(newDate)) {
        newErrors.newDate = 'Please enter date in YYYY-MM-DD format';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(newDate);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (isNaN(selectedDate.getTime())) {
          newErrors.newDate = 'Invalid date';
        } else if (selectedDate < today) {
          newErrors.newDate = 'Delivery date must be today or a future date';
        }
      }
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
      // Convert date string to ISO format
      const dateObj = new Date(newDate);
      dateObj.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      const result = await orderService.changeDeliveryDate(leadId, {
        newDeliveryDate: dateObj.toISOString(),
        reason: reason.trim() || '',
      });

      if (result.success) {
        Alert.alert('Success', 'Delivery date updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              setNewDate('');
              setReason('');
              setErrors({});
              onSuccess && onSuccess();
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update delivery date');
      }
    } catch (error) {
      console.error('Error changing date:', error);
      Alert.alert('Error', 'Failed to update delivery date. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
            <Text style={styles.title}>Change Delivery Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Delivery Date</Text>
              <View style={styles.currentInfoBox}>
                <Text style={styles.currentInfoText}>
                  {order?.deliveryExpectedDate
                    ? formatDate(new Date(order.deliveryExpectedDate))
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningBox}>
              <Icon name="alert-triangle" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Delivery date changes are only allowed within 48 hours of order placement
              </Text>
            </View>

            {/* New Date Form */}
            <View style={styles.section}>
              <Text style={styles.label}>
                New Delivery Date <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.dateInput, errors.newDate && styles.inputError]}
                value={newDate}
                onChangeText={(text) => {
                  setNewDate(text);
                  if (errors.newDate) {
                    setErrors({ ...errors, newDate: null });
                  }
                }}
                placeholder="YYYY-MM-DD (e.g., 2025-12-25)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                onBlur={validateForm}
              />
              {errors.newDate && (
                <Text style={styles.errorText}>{errors.newDate}</Text>
              )}
              <Text style={styles.helperText}>
                Enter date in YYYY-MM-DD format. Must be today or a future date.
              </Text>
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
                placeholder="Why are you changing the delivery date? (max 200 characters)"
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
                    {loading ? 'Updating...' : 'Update Date'}
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
  dateInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
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

export default ChangeDateModal;

