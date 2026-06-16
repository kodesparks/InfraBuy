import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../assets/styles/global';
import { geocodingService } from '../../services/location/geocodingService';

const PincodeModal = ({ visible, onClose, onPincodeSet }) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);


  const handleConfirm = async () => {
    if (!pincode.trim()) {
      Alert.alert('Error', 'Please enter a pincode');
      return;
    }

    if (!geocodingService.validatePincode(pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    try {
      const locationData = await geocodingService.getCoordinatesFromPincode(pincode);

      // Call the callback with pincode and location data
      onPincodeSet({
        pincode: pincode.trim(),
        location: locationData,
      });

      setPincode('');
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to validate pincode');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPincode('');
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter Pincode</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            maxLength={6}
            autoFocus={true}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              (!pincode.trim() || loading) && styles.disabledButton
            ]}
            onPress={handleConfirm}
            disabled={!pincode.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    ...shadows.cloud,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.on_surface,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface_container_low,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: colors.on_surface_variant,
    fontWeight: '300',
  },
  content: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.on_surface_variant,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface_container_low,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.on_surface,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface_container,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    ...shadows.cloud,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PincodeModal;



