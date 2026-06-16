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
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { spacing, borderRadius } from '../../assets/styles/global';
import { useTheme } from '../../context/ThemeContext';
import { updateProfile } from '../../services/api';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

const EditProfileModal = ({ visible, onClose, user, onSuccess }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [contractId, setContractId] = useState(user?.contractId || '');
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (visible) {
      setName(user?.name || '');
      setAddress(user?.address || '');
      setPincode(user?.pincode || '');
      setContractId(user?.contractId || '');
      setGstNumber(user?.gstNumber || '');
      setErrors({});
    }
  }, [visible, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = t('Name is required');
    }

    if (!address.trim()) {
      newErrors.address = t('Address is required');
    }

    if (!pincode.trim()) {
      newErrors.pincode = t('Pincode is required');
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = t('Pincode must be 6 digits');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Alert.alert(t('Error'), t('User ID not found'));
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        name: name.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        contractId: contractId.trim(),
        gstNumber: gstNumber.trim(),
      };

      const result = await updateProfile(user.id, profileData);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t('Success!'),
          text2: result.message || t('Profile updated successfully'),
        });
        // Pass updated user data directly to avoid API call
        onSuccess(result.data);
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: t('Error'),
          text2: result.error?.message || t('Failed to update profile'),
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Failed to update profile'),
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
            <Text style={styles.modalTitle}>{t('Edit Profile')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Full Name *')}</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors({ ...errors, name: null });
                    }
                  }}
                  placeholder={t('Enter your full name')}
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Address *')}</Text>
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
                  placeholder={t('Enter your address')}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Pincode *')}</Text>
                <TextInput
                  style={[styles.input, errors.pincode && styles.inputError]}
                  value={pincode}
                  onChangeText={(text) => {
                    setPincode(text.replace(/[^0-9]/g, ''));
                    if (errors.pincode) {
                      setErrors({ ...errors, pincode: null });
                    }
                  }}
                  placeholder={t('Enter 6-digit pincode')}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {errors.pincode && (
                  <Text style={styles.errorText}>{errors.pincode}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Contract ID')}</Text>
                <TextInput
                  style={[styles.input, errors.contractId && styles.inputError]}
                  value={contractId}
                  onChangeText={(text) => {
                    setContractId(text);
                    if (errors.contractId) {
                      setErrors({ ...errors, contractId: null });
                    }
                  }}
                  placeholder={t('Enter contract ID')}
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.contractId && (
                  <Text style={styles.errorText}>{errors.contractId}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('GST Number')}</Text>
                <TextInput
                  style={styles.input}
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  placeholder={t('Enter GST Number')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                  maxLength={15}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>{t('Save Changes')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background || colors.white || '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
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
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
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
    color: colors.textWhite || colors.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileModal;
