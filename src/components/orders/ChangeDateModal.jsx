import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../assets/styles/global';
import { orderService } from '../../services/api/orderService';

const ChangeDateModal = ({ visible, onClose, order, onSuccess }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!newDate.trim()) {
      newErrors.newDate = t('Delivery date is required');
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(newDate)) {
        newErrors.newDate = t('Please enter date in YYYY-MM-DD format');
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(newDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
          newErrors.newDate = t('Invalid date');
        } else if (selectedDate < today) {
          newErrors.newDate = t('Delivery date must be today or a future date');
        }
      }
    }

    if (reason && reason.length > 200) {
      newErrors.reason = t('Reason must be less than 200 characters');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!order?.id && !order?.leadId) {
      Alert.alert(t('Error'), t('Invalid order information'));
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
        Alert.alert(t('Success'), t('Delivery date updated successfully'), [
          {
            text: t('OK'),
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
        Alert.alert(t('Error'), result.error || t('Failed to update delivery date'));
      }
    } catch (error) {
      console.error('Error changing date:', error);
      Alert.alert(t('Error'), t('Failed to update delivery date. Please try again.'));
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
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('Change Delivery Date')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Current Delivery Date')}</Text>
              <View style={styles.currentInfoBox}>
                <Text style={styles.currentInfoText}>
                  {order?.deliveryExpectedDate
                    ? formatDate(new Date(order.deliveryExpectedDate))
                    : t('N/A')}
                </Text>
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningBox}>
              <Icon name="alert-triangle" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                {t('Delivery date changes are only allowed within 48 hours of order placement')}
              </Text>
            </View>

            {/* New Date Form */}
            <View style={styles.section}>
              <Text style={styles.label}>
                {t('New Delivery Date')} <Text style={styles.required}>*</Text>
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
                placeholder={t('YYYY-MM-DD (e.g., 2025-12-25)')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                onBlur={validateForm}
              />
              {errors.newDate && (
                <Text style={styles.errorText}>{errors.newDate}</Text>
              )}
              <Text style={styles.helperText}>
                {t('Enter date in YYYY-MM-DD format. Must be today or a future date.')}
              </Text>
            </View>

            {/* Reason */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('Reason (Optional)')}</Text>
              <TextInput
                style={[styles.textArea, errors.reason && styles.inputError]}
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  if (errors.reason) {
                    setErrors({ ...errors, reason: null });
                  }
                }}
                placeholder={t('Why are you changing the delivery date? (max 200 characters)')}
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
                <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : colors.primaryGradient}
                  style={styles.updateButtonGradient}
                >
                  <Icon name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.updateButtonText}>
                    {loading ? t('Updating...') : t('Update Date')}
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

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    padding: spacing.lg,
    borderWidth: isDarkMode ? 1.5 : 0,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
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
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  currentInfoBox: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  currentInfoText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: isDarkMode ? '#FBBF24' : '#92400E',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: '#EF4444',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
  },
  helperText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
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
    borderColor: colors.border,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangeDateModal;



