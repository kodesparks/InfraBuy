import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { updateMobile } from '../../services/api';
import Toast from 'react-native-toast-message';

const EditMobileModal = ({ visible, onClose, user, onSuccess }) => {
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (visible) {
      setPhone(user?.phone || '');
      setPassword('');
      setErrors({});
    }
  }, [visible, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    if (phone.trim() === user.phone) {
      Alert.alert('Info', 'Phone number is the same as current phone');
      return;
    }

    setLoading(true);
    try {
      const mobileData = {
        phone: phone.trim(),
        ...(password ? { password } : {}),
      };

      const result = await updateMobile(user.id, mobileData);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.message || 'Mobile number updated successfully',
        });
        // Pass updated user data directly to avoid API call
        onSuccess(result.data);
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.error?.message || 'Failed to update mobile number',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update mobile number',
      });
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Mobile Number</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={phone}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setPhone(numericText.slice(0, 10));
                  if (errors.phone) {
                    setErrors({ ...errors, phone: null });
                  }
                }}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password (Optional)</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password for verification"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <Text style={styles.helperText}>
                Some accounts may require password verification
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Update Mobile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  form: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
};

export default EditMobileModal;

