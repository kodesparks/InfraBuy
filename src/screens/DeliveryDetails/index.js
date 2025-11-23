import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius, typography } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import { cartService } from '../../services/api/cartService';

const DeliveryDetails = ({ navigation, route }) => {
  const { cartItems, userPincode, fetchCartItems } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items to cart first.');
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
        const errorMessages = failedOrders.map(r => r.error).join('\n');
        Alert.alert(
          'Order Placement Failed',
          `Some orders could not be placed:\n${errorMessages}`,
          [
            { text: 'OK', onPress: async () => {
              // Refresh cart and navigate to orders
              await fetchCartItems();
              navigation.navigate('MainApp', { screen: 'Orders' });
            }}
          ]
        );
      } else {
        // All orders placed successfully
        Alert.alert(
          'Order Placed Successfully!',
          'Your order has been placed. You can track it in the Orders section.',
          [
            { 
              text: 'View Orders', 
              onPress: async () => {
                // Refresh cart (will be empty as orders are no longer pending)
                await fetchCartItems();
                // Navigate to orders page
                navigation.navigate('MainApp', { screen: 'Orders' });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error placing orders:', error);
      Alert.alert('Error', 'Failed to place orders. Please try again.');
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
          
          {renderInputField('preferredDeliveryDate', 'Preferred Delivery Date', 'YYYY-MM-DD (optional)', {
            keyboardType: 'default',
          })}
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

