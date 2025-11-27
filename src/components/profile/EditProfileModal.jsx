import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { updateProfile } from '../../services/api';
import Toast from 'react-native-toast-message';

const EditProfileModal = ({ visible, onClose, user, onSuccess }) => {
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (visible) {
      setName(user?.name || '');
      setAddress(user?.address || '');
      setPincode(user?.pincode || '');
      setErrors({});
    }
  }, [visible, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits';
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

    setLoading(true);
    try {
      const profileData = {
        name: name.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
      };

      const result = await updateProfile(user.id, profileData);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.message || 'Profile updated successfully',
        });
        // Pass updated user data directly to avoid API call
        onSuccess(result.data);
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.error?.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile',
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
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors({ ...errors, name: null });
                    }
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.address && styles.inputError,
                  ]}
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    if (errors.address) {
                      setErrors({ ...errors, address: null });
                    }
                  }}
                  placeholder="Enter your address"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pincode *</Text>
                <TextInput
                  style={[styles.input, errors.pincode && styles.inputError]}
                  value={pincode}
                  onChangeText={(text) => {
                    setPincode(text.replace(/[^0-9]/g, ''));
                    if (errors.pincode) {
                      setErrors({ ...errors, pincode: null });
                    }
                  }}
                  placeholder="Enter 6-digit pincode"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {errors.pincode && (
                  <Text style={styles.errorText}>{errors.pincode}</Text>
                )}
              </View>
            </View>
          </ScrollView>

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
                <Text style={styles.submitButtonText}>Save Changes</Text>
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
    maxHeight: '90%',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
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

export default EditProfileModal;

