import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { colors, spacing, borderRadius, typography } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import { cartService } from '../../services/api/cartService';

const DeliveryDetails = ({ navigation, route }) => {
  const { cartItems, userPincode, fetchCartItems } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state - pre-fill pincode if available
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    deliveryAddress: '',
    city: '',
    state: '',
    pinCode: userPincode || '',
    preferredDeliveryDate: '',
  });

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'fullName':
        if (!value || value.trim() === '') {
          newErrors.fullName = 'Full name is required';
        } else {
          delete newErrors.fullName;
        }
        break;
      
      case 'phoneNumber':
        if (!value || value.trim() === '') {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value)) {
          newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
      
      case 'email':
        if (value && value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'deliveryAddress':
        if (!value || value.trim() === '') {
          newErrors.deliveryAddress = 'Delivery address is required';
        } else if (value.length > 500) {
          newErrors.deliveryAddress = 'Address must be less than 500 characters';
        } else {
          delete newErrors.deliveryAddress;
        }
        break;
      
      case 'city':
        if (!value || value.trim() === '') {
          newErrors.city = 'City is required';
        } else {
          delete newErrors.city;
        }
        break;
      
      case 'state':
        if (!value || value.trim() === '') {
          newErrors.state = 'State is required';
        } else {
          delete newErrors.state;
        }
        break;
      
      case 'pinCode':
        if (!value || value.trim() === '') {
          newErrors.pinCode = 'PIN code is required';
        } else if (!/^\d{6}$/.test(value)) {
          newErrors.pinCode = 'Please enter a valid 6-digit PIN code';
        } else {
          delete newErrors.pinCode;
        }
        break;
      
      case 'preferredDeliveryDate':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            newErrors.preferredDeliveryDate = 'Delivery date must be today or a future date';
          } else {
            delete newErrors.preferredDeliveryDate;
          }
        } else {
          delete newErrors.preferredDeliveryDate;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = ['fullName', 'phoneNumber', 'deliveryAddress', 'city', 'state', 'pinCode'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    // Validate optional fields if provided
    if (formData.email) {
      validateField('email', formData.email);
    }
    if (formData.preferredDeliveryDate) {
      validateField('preferredDeliveryDate', formData.preferredDeliveryDate);
    }
    
    return isValid && Object.keys(errors).length === 0;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.totalPrice || (item.currentPrice || 0) * (item.quantity || 1));
    }, 0);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields correctly.',
      });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Empty Cart',
        text2: 'Your cart is empty. Please add items to cart first.',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const deliveryAddress = `${formData.deliveryAddress}, ${formData.city}, ${formData.state}`;
      
      // Convert date to ISO format if provided, otherwise use default (3 days from now)
      let deliveryExpectedDate;
      if (formData.preferredDeliveryDate) {
        const date = new Date(formData.preferredDeliveryDate);
        // If date is in YYYY-MM-DD format, set time to midnight UTC
        if (!isNaN(date.getTime())) {
          deliveryExpectedDate = date.toISOString();
        } else {
          deliveryExpectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        }
      } else {
        deliveryExpectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      }

      const orderData = {
        deliveryAddress,
        deliveryPincode: formData.pinCode,
        deliveryExpectedDate,
        receiverMobileNum: formData.phoneNumber,
      };

      // Place order for each cart item
      const placeOrderPromises = cartItems.map(item => 
        cartService.placeOrder(item.leadId, orderData)
      );

      const results = await Promise.all(placeOrderPromises);
      
      // Check if all orders were placed successfully
      const failedOrders = results.filter(r => !r.success);
      
      if (failedOrders.length > 0) {
        const errorMessages = failedOrders.map(r => r.error).join(', ');
        Toast.show({
          type: 'error',
          text1: 'Order Placement Failed',
          text2: `Some orders could not be placed: ${errorMessages}`,
        });
        // Refresh cart and navigate to orders
        await fetchCartItems();
        setTimeout(() => {
          navigation.navigate('MainApp', { screen: 'Orders' });
        }, 2000);
      } else {
        // All orders placed successfully - Show success message and navigate to Orders
        await fetchCartItems();
        Toast.show({
          type: 'success',
          text1: 'Order Placed Successfully!',
          text2: 'Your order has been placed. Please wait for vendor approval. You can complete the payment from the Orders section once the order is approved.',
        });
        setTimeout(() => {
          navigation.navigate('MainApp', { screen: 'Orders' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error placing orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to place orders. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (name, label, placeholder, options = {}) => {
    const {
      keyboardType = 'default',
      maxLength,
      multiline = false,
      numberOfLines = 1,
      required = false,
    } = options;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[
            styles.input,
            multiline && styles.textArea,
            errors[name] && styles.inputError,
          ]}
          value={formData[name]}
          onChangeText={(value) => handleInputChange(name, value)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onBlur={() => validateField(name, formData[name])}
        />
        {errors[name] && (
          <Text style={styles.errorText}>{errors[name]}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {renderInputField('fullName', 'Full Name', 'Enter your full name', { required: true })}
          
          {renderInputField('phoneNumber', 'Phone Number', 'Enter your phone number', {
            required: true,
            keyboardType: 'phone-pad',
            maxLength: 10,
          })}
          
          {renderInputField('email', 'Email', 'Enter your email (optional)', {
            keyboardType: 'email-address',
          })}
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          
          {renderInputField('deliveryAddress', 'Delivery Address', 'Enter complete delivery address with landmarks', {
            required: true,
            multiline: true,
            numberOfLines: 4,
            maxLength: 500,
          })}
          
          {renderInputField('city', 'City', 'City', { required: true })}
          
          {renderInputField('state', 'State', 'State', { required: true })}
          
          {renderInputField('pinCode', 'PIN Code', '6-digit PIN code', {
            required: true,
            keyboardType: 'number-pad',
            maxLength: 6,
          })}
          
          {/* Date Picker for Delivery Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Preferred Delivery Date <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.datePickerButton,
                errors.preferredDeliveryDate && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[
                styles.datePickerText,
                !formData.preferredDeliveryDate && styles.datePickerPlaceholder
              ]}>
                {formData.preferredDeliveryDate 
                  ? new Date(formData.preferredDeliveryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Select delivery date (optional)'}
              </Text>
              <Icon name="calendar" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {errors.preferredDeliveryDate && (
              <Text style={styles.errorText}>{errors.preferredDeliveryDate}</Text>
            )}
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.preferredDeliveryDate ? new Date(formData.preferredDeliveryDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                }
                if (event.type === 'set' && selectedDate) {
                  // Format as YYYY-MM-DD
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  handleInputChange('preferredDeliveryDate', `${year}-${month}-${day}`);
                } else if (event.type === 'dismissed') {
                  setShowDatePicker(false);
                }
              }}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={styles.datePickerCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerDoneButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={['#723FED', '#3B58EB']}
            style={styles.placeOrderButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
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
  optional: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 'normal',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: spacing.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  datePickerPlaceholder: {
    color: colors.textSecondary,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  datePickerCancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  datePickerCancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  datePickerDoneButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#723FED',
  },
  placeOrderButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});

export default DeliveryDetails;

