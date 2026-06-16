import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { orderService } from '../../services/api/orderService';
import { cartService } from '../../services/api/cartService';
import { spacing } from '../../assets/styles/global';
import createStyles from '../../assets/styles/payment';

// Bank details for UTR / RTGS / NEFT / Cheque (handoff doc Section 6.1)
const BANK_DETAILS = {
  name: 'INFRAEXPERT SOLUTIONS LLP',
  accountNumber: '925020028741798',
  ifscCode: 'UTIB0001158',
  branch: 'LAKSHMIPURAM, GUNTUR',
};

const PaymentScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const { t } = useTranslation();
  const { cartItems, clearCart } = useAppContext();
  const { user } = useAuth();

  // Get order data from route params (for order payment flow) or use cart items
  const orderData = route?.params?.orderData || null;
  const isOrderPaymentFlow = Boolean(orderData);
  const deliveryDetails = route?.params?.deliveryDetails || null;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    upiId: '',
    walletType: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    transactionId: '',
    chequeNumber: '',
    ddNumber: '',
    utrNum: '',
    utrBankName: '',
    utrAccountNumber: '',
    manualPaymentAmount: '',
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'manual_utr',
      name: 'MANUAL UTR',
      icon: 'hash',
      description: 'Enter UTR number for bank transfer',
      color: '#3B82F6',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'credit-card',
      description: 'Pay with your credit or debit card',
      color: '#6366F1',
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: 'smartphone',
      description: 'Pay using UPI apps like PhonePe, Google Pay',
      color: '#8B5CF6',
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: 'wallet',
      description: 'Pay using digital wallets',
      color: '#EC4899',
    },
    {
      id: 'rtgs',
      name: 'RTGS Transfer',
      icon: 'building',
      description: 'Real Time Gross Settlement (large amounts)',
      color: '#10B981',
    },
    {
      id: 'neft',
      name: 'NEFT Transfer',
      icon: 'dollar-sign',
      description: 'National Electronic Funds Transfer',
      color: '#059669',
    },
    {
      id: 'cheque',
      name: 'Cheque Payment',
      icon: 'file-text',
      description: 'Pay via cheque (subject to clearance)',
      color: '#F59E0B',
    },
    {
      id: 'dd',
      name: 'Demand Draft',
      icon: 'file-text',
      description: 'Pay via demand draft',
      color: '#EF4444',
    },
  ];

  // Calculate totals
  const calculateTotal = () => {
    if (isOrderPaymentFlow && orderData) {
      return orderData.totalAmount || orderData.finalAmount || 0;
    }
    return cartItems.reduce((total, item) => {
      return total + (item.totalPrice || (item.currentPrice || 0) * (item.quantity || 1));
    }, 0);
  };

  const totalAmount = calculateTotal();
  const displayItems = isOrderPaymentFlow ? (orderData?.items || []) : cartItems;

  useEffect(() => {
    // Redirect if cart is empty and not order payment flow
    if (!isOrderPaymentFlow && cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [cartItems, isOrderPaymentFlow]);

  const handlePaymentMethodChange = (methodId) => {
    if (methodId !== 'manual_utr') {
      Alert.alert(t('Coming Soon'), t('This payment method will come soon'));
      return;
    }

    setSelectedPaymentMethod(methodId);
    setErrors({});
    setPaymentData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      upiId: '',
      walletType: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      transactionId: '',
      chequeNumber: '',
      ddNumber: '',
      utrNum: '',
      utrBankName: '',
      utrAccountNumber: '',
      manualPaymentAmount: '',
    });

    // Open manual payment modal if manual UTR is selected
    if (methodId === 'manual_utr') {
      setShowManualPaymentModal(true);
    }
  };

  const handleInputChange = (name, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validatePaymentData = () => {
    const newErrors = {};

    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
      return false;
    }

    if (selectedPaymentMethod === 'card') {
      if (!paymentData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }

      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
      }

      if (!paymentData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = 'Please enter a valid CVV';
      }

      if (!paymentData.cardName) {
        newErrors.cardName = 'Cardholder name is required';
      }
    }

    if (selectedPaymentMethod === 'upi') {
      if (!paymentData.upiId) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(paymentData.upiId)) {
        newErrors.upiId = 'Please enter a valid UPI ID';
      }
    }

    if (selectedPaymentMethod === 'wallet') {
      if (!paymentData.walletType) {
        newErrors.walletType = 'Please select a wallet type';
      }
    }

    if (selectedPaymentMethod === 'rtgs' || selectedPaymentMethod === 'neft') {
      if (!paymentData.bankName) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!paymentData.accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      } else if (!/^\d{9,18}$/.test(paymentData.accountNumber)) {
        newErrors.accountNumber = 'Please enter a valid account number';
      }
      if (!paymentData.ifscCode) {
        newErrors.ifscCode = 'IFSC code is required';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(paymentData.ifscCode.toUpperCase())) {
        newErrors.ifscCode = 'Please enter a valid IFSC code';
      }
      if (!paymentData.accountHolderName) {
        newErrors.accountHolderName = 'Account holder name is required';
      }
      if (!paymentData.transactionId) {
        newErrors.transactionId = 'Transaction ID is required';
      }
    }

    if (selectedPaymentMethod === 'cheque') {
      if (!paymentData.chequeNumber) {
        newErrors.chequeNumber = 'Cheque number is required';
      }
      if (!paymentData.bankName) {
        newErrors.bankName = 'Bank name is required';
      }
    }

    if (selectedPaymentMethod === 'dd') {
      if (!paymentData.ddNumber) {
        newErrors.ddNumber = 'DD number is required';
      }
      if (!paymentData.bankName) {
        newErrors.bankName = 'Bank name is required';
      }
    }

    if (selectedPaymentMethod === 'manual_utr') {
      if (!paymentData.manualPaymentAmount) {
        newErrors.manualPaymentAmount = 'Amount is required';
      } else if (isNaN(paymentData.manualPaymentAmount) || parseFloat(paymentData.manualPaymentAmount) <= 0) {
        newErrors.manualPaymentAmount = 'Please enter a valid amount';
      }

      if (!paymentData.utrNum) {
        newErrors.utrNum = 'UTR number is required';
      } else if (!/^[A-Z0-9]{9,18}$/i.test(paymentData.utrNum)) {
        newErrors.utrNum = 'Please enter a valid UTR number (9-18 alphanumeric characters)';
      }
      if (!paymentData.utrBankName) {
        newErrors.utrBankName = 'Bank name is required';
      }
      // Account number is now optional as per user request
      if (paymentData.utrAccountNumber && !/^\d{9,18}$/.test(paymentData.utrAccountNumber)) {
        newErrors.utrAccountNumber = 'Please enter a valid account number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePaymentData()) return;

    if (!orderData?.id) {
      setErrors({ paymentMethod: 'Order ID is missing. Cannot process payment.' });
      return;
    }

    setIsProcessing(true);
    try {
      // The client explicitly requested this payload format for the PUT endpoint:
      // { "utrNum": "...", "bankName": "...", "accNumber": "...", "paidAmount": "..." }

      let result;

      const isBankTransfer = ['manual_utr', 'rtgs', 'neft', 'cheque', 'dd'].includes(selectedPaymentMethod);

      if (isBankTransfer) {
        const manualPayload = {
          utrNum: paymentData.utrNum || paymentData.transactionId || paymentData.chequeNumber || paymentData.ddNumber || '',
          bankName: paymentData.utrBankName || paymentData.bankName || '',
          accNumber: paymentData.utrAccountNumber || paymentData.accountNumber || '',
          paidAmount: paymentData.manualPaymentAmount || String(totalAmount),
          transactionId: paymentData.transactionId || '',
        };
        // Use the PUT /api/order/customer/orders/{leadId} endpoint as requested for offline payments
        result = await cartService.updateOrder(orderData.id, manualPayload);
      } else {
        let paymentType = selectedPaymentMethod;
        let paymentMode = 'online';

        if (selectedPaymentMethod === 'cash_on_delivery') {
          paymentMode = 'cash_on_delivery';
        }

        const payload = {
          paymentType,
          paymentMode,
          ...paymentData,
          amountPaid: parseFloat(paymentData.manualPaymentAmount || 0),
          paidAmount: parseFloat(paymentData.manualPaymentAmount || 0),
          totalAmount: totalAmount,
        };
        result = await orderService.processPayment(orderData.id, payload);
      }

      if (result.success) {
        setIsProcessing(false);
        setOrderPlaced(true);

        // Clear cart only for standard checkout flow
        if (!isOrderPaymentFlow) {
          clearCart();
        }

        setTimeout(() => {
          navigation.navigate('MainApp', {
            screen: 'Orders',
            params: {
              message: selectedPaymentMethod === 'manual_utr'
                ? 'Payment submitted for verification!'
                : 'Payment completed successfully!',
              orderId: orderData.id,
              refresh: true,
            },
          });
        }, 2000);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setIsProcessing(false);
      setErrors({ paymentMethod: error.message || 'Payment processing failed. Please try again.' });
    }
  };

  if (orderPlaced) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <Icon name="check-circle" size={64} color={colors.success} />
          <Text style={styles.successTitle}>
            {selectedPaymentMethod === 'manual_utr' ? 'Payment Submitted!' : 'Payment Successful!'}
          </Text>
          <Text style={styles.successMessage}>
            {selectedPaymentMethod === 'manual_utr'
              ? 'Your payment details have been submitted for verification. Your order status will update shortly.'
              : 'Your payment has been processed successfully.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.content}>
            {/* Payment Methods Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Payment Method</Text>
              <View style={styles.paymentMethodsGrid}>
                {paymentMethods.map((method) => {
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethodCard,
                        isSelected && styles.paymentMethodCardSelected,
                      ]}
                      onPress={() => handlePaymentMethodChange(method.id)}
                    >
                      <View
                        style={[
                          styles.paymentMethodIcon,
                          isSelected && [styles.paymentMethodIconSelected, { backgroundColor: method.color }],
                          !isSelected && { backgroundColor: method.color + '15' },
                        ]}
                      >
                        <Icon
                          name={method.icon}
                          size={28}
                          color={isSelected ? '#ffffff' : method.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.paymentMethodName,
                            isSelected && styles.paymentMethodNameSelected,
                          ]}
                        >
                          {method.name}
                        </Text>
                        <Text style={styles.paymentMethodDescription}>
                          {method.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.paymentMethod && (
                <Text style={styles.errorText}>{errors.paymentMethod}</Text>
              )}
            </View>

            {/* Payment Form */}
            {selectedPaymentMethod && selectedPaymentMethod !== 'manual_utr' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Details</Text>

                {/* Card Payment Form */}
                {selectedPaymentMethod === 'card' && (
                  <View style={styles.form}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Card Number *</Text>
                      <TextInput
                        style={[styles.input, errors.cardNumber && styles.inputError]}
                        value={paymentData.cardNumber}
                        onChangeText={(text) =>
                          handleInputChange('cardNumber', formatCardNumber(text))
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        keyboardType="numeric"
                      />
                      {errors.cardNumber && (
                        <Text style={styles.errorText}>{errors.cardNumber}</Text>
                      )}
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.xs }]}>
                        <Text style={styles.label}>Expiry Date *</Text>
                        <TextInput
                          style={[styles.input, errors.expiryDate && styles.inputError]}
                          value={paymentData.expiryDate}
                          onChangeText={(text) =>
                            handleInputChange('expiryDate', formatExpiryDate(text))
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                          keyboardType="numeric"
                        />
                        {errors.expiryDate && (
                          <Text style={styles.errorText}>{errors.expiryDate}</Text>
                        )}
                      </View>

                      <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.xs }]}>
                        <Text style={styles.label}>CVV *</Text>
                        <TextInput
                          style={[styles.input, errors.cvv && styles.inputError]}
                          value={paymentData.cvv}
                          onChangeText={(text) => handleInputChange('cvv', text.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={4}
                          keyboardType="numeric"
                          secureTextEntry
                        />
                        {errors.cvv && (
                          <Text style={styles.errorText}>{errors.cvv}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Cardholder Name *</Text>
                      <TextInput
                        style={[styles.input, errors.cardName && styles.inputError]}
                        value={paymentData.cardName}
                        onChangeText={(text) => handleInputChange('cardName', text)}
                        placeholder="Enter cardholder name"
                      />
                      {errors.cardName && (
                        <Text style={styles.errorText}>{errors.cardName}</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* UPI Payment Form */}
                {selectedPaymentMethod === 'upi' && (
                  <View style={styles.form}>
                    <View style={styles.upiOptions}>
                      <Text style={styles.label}>Select UPI App:</Text>
                      <View style={styles.upiAppsGrid}>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'googlepay' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'googlepay')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: '#4285F4' + '20' }]}>
                            <Icon name="smartphone" size={24} color="#4285F4" />
                          </View>
                          <Text style={styles.upiAppName}>Google Pay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'phonepe' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'phonepe')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: '#5F259F' + '20' }]}>
                            <Icon name="smartphone" size={24} color="#5F259F" />
                          </View>
                          <Text style={styles.upiAppName}>PhonePe</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'paytm' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'paytm')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: '#00BAF2' + '20' }]}>
                            <Icon name="smartphone" size={24} color="#00BAF2" />
                          </View>
                          <Text style={styles.upiAppName}>Paytm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'other' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'other')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: colors.textSecondary + '20' }]}>
                            <Icon name="smartphone" size={24} color={colors.textSecondary} />
                          </View>
                          <Text style={styles.upiAppName}>Other</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>UPI ID *</Text>
                      <TextInput
                        style={[styles.input, errors.upiId && styles.inputError]}
                        value={paymentData.upiId}
                        onChangeText={(text) => handleInputChange('upiId', text)}
                        placeholder="yourname@paytm / yourname@ybl / yourname@okaxis"
                        autoCapitalize="none"
                      />
                      {errors.upiId && (
                        <Text style={styles.errorText}>{errors.upiId}</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Wallet Payment Form */}
                {selectedPaymentMethod === 'wallet' && (
                  <View style={styles.form}>
                    <View style={styles.upiOptions}>
                      <Text style={styles.label}>Select Wallet:</Text>
                      <View style={styles.upiAppsGrid}>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'paytm' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'paytm')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: '#00BAF2' + '20' }]}>
                            <Icon name="smartphone" size={24} color="#00BAF2" />
                          </View>
                          <Text style={styles.upiAppName}>Paytm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'phonepe' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'phonepe')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: '#5F259F' + '20' }]}>
                            <Icon name="smartphone" size={24} color="#5F259F" />
                          </View>
                          <Text style={styles.upiAppName}>PhonePe</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'googlepay' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'googlepay')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: '#4285F4' + '20' }]}>
                            <Icon name="smartphone" size={24} color="#4285F4" />
                          </View>
                          <Text style={styles.upiAppName}>Google Pay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.upiAppCard, paymentData.walletType === 'amazonpay' && styles.upiAppCardSelected]}
                          onPress={() => handleInputChange('walletType', 'amazonpay')}
                        >
                          <View style={[styles.upiAppIcon, { backgroundColor: '#FF9900' + '20' }]}>
                            <Icon name="smartphone" size={24} color="#FF9900" />
                          </View>
                          <Text style={styles.upiAppName}>Amazon Pay</Text>
                        </TouchableOpacity>
                      </View>
                      {errors.walletType && (
                        <Text style={styles.errorText}>{errors.walletType}</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* RTGS/NEFT Payment Form */}
                {(selectedPaymentMethod === 'rtgs' || selectedPaymentMethod === 'neft') && (
                  <View style={styles.form}>
                    <View style={styles.infoBox}>
                      <Icon name="info" size={20} color={colors.info} />
                      <Text style={styles.infoText}>
                        {selectedPaymentMethod === 'rtgs'
                          ? 'RTGS is available for large transfers. Transfer will be processed in real-time.'
                          : 'NEFT transfers are processed in batches throughout the day.'}
                      </Text>
                    </View>

                    <View style={[styles.infoBox, { flexDirection: 'column' }]}>
                      <Text style={[styles.label, { marginBottom: 8, fontSize: 16 }]}>Bank Account Details (Transfer To)</Text>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>Bank Name</Text>
                        <Text style={[styles.infoText, { fontWeight: '600' }]}>{BANK_DETAILS.name}</Text>
                      </View>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>Account</Text>
                        <Text style={[styles.infoText, { fontWeight: '600' }]}>{BANK_DETAILS.accountNumber}</Text>
                      </View>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>IFSC</Text>
                        <Text style={[styles.infoText, { fontWeight: '600' }]}>{BANK_DETAILS.ifscCode}</Text>
                      </View>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>Branch</Text>
                        <Text style={[styles.infoText, { fontWeight: '600' }]}>{BANK_DETAILS.branch}</Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.xs }]}>
                        <Text style={styles.label}>Bank Name *</Text>
                        <TextInput
                          style={[styles.input, errors.bankName && styles.inputError]}
                          value={paymentData.bankName}
                          onChangeText={(text) => handleInputChange('bankName', text)}
                          placeholder="Enter bank name"
                        />
                        {errors.bankName && (
                          <Text style={styles.errorText}>{errors.bankName}</Text>
                        )}
                      </View>

                      <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.xs }]}>
                        <Text style={styles.label}>Account Number *</Text>
                        <TextInput
                          style={[styles.input, errors.accountNumber && styles.inputError]}
                          value={paymentData.accountNumber}
                          onChangeText={(text) =>
                            handleInputChange('accountNumber', text.replace(/\D/g, ''))
                          }
                          placeholder="Enter account number"
                          keyboardType="numeric"
                        />
                        {errors.accountNumber && (
                          <Text style={styles.errorText}>{errors.accountNumber}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.xs }]}>
                        <Text style={styles.label}>IFSC Code *</Text>
                        <TextInput
                          style={[styles.input, errors.ifscCode && styles.inputError]}
                          value={paymentData.ifscCode}
                          onChangeText={(text) =>
                            handleInputChange('ifscCode', text.toUpperCase())
                          }
                          placeholder="e.g., SBIN0001234"
                          autoCapitalize="characters"
                        />
                        {errors.ifscCode && (
                          <Text style={styles.errorText}>{errors.ifscCode}</Text>
                        )}
                      </View>

                      <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.xs }]}>
                        <Text style={styles.label}>Account Holder Name *</Text>
                        <TextInput
                          style={[styles.input, errors.accountHolderName && styles.inputError]}
                          value={paymentData.accountHolderName}
                          onChangeText={(text) => handleInputChange('accountHolderName', text)}
                          placeholder="Enter account holder name"
                        />
                        {errors.accountHolderName && (
                          <Text style={styles.errorText}>{errors.accountHolderName}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Transaction ID *</Text>
                      <TextInput
                        style={[styles.input, errors.transactionId && styles.inputError]}
                        value={paymentData.transactionId}
                        onChangeText={(text) => handleInputChange('transactionId', text)}
                        placeholder="Enter transaction ID from your bank"
                      />
                      {errors.transactionId && (
                        <Text style={styles.errorText}>{errors.transactionId}</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Cheque Payment Form */}
                {selectedPaymentMethod === 'cheque' && (
                  <View style={styles.form}>
                    <View style={styles.warningBox}>
                      <Icon name="alert-circle" size={20} color={colors.warning} />
                      <Text style={styles.warningText}>
                        Draw cheque in favour of {BANK_DETAILS.name}. Order will be processed only after cheque clearance.
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.xs }]}>
                        <Text style={styles.label}>Cheque Number *</Text>
                        <TextInput
                          style={[styles.input, errors.chequeNumber && styles.inputError]}
                          value={paymentData.chequeNumber}
                          onChangeText={(text) => handleInputChange('chequeNumber', text)}
                          placeholder="Enter cheque number"
                        />
                        {errors.chequeNumber && (
                          <Text style={styles.errorText}>{errors.chequeNumber}</Text>
                        )}
                      </View>

                      <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.xs }]}>
                        <Text style={styles.label}>Bank Name *</Text>
                        <TextInput
                          style={[styles.input, errors.bankName && styles.inputError]}
                          value={paymentData.bankName}
                          onChangeText={(text) => handleInputChange('bankName', text)}
                          placeholder="Enter bank name"
                        />
                        {errors.bankName && (
                          <Text style={styles.errorText}>{errors.bankName}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {/* DD Payment Form */}
                {selectedPaymentMethod === 'dd' && (
                  <View style={styles.form}>
                    <View style={styles.successBox}>
                      <Icon name="info" size={20} color={colors.success} />
                      <Text style={styles.successBoxText}>
                        Please ensure the DD is drawn in favor of our company name. Order will be
                        processed upon receipt of the DD.
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.xs }]}>
                        <Text style={styles.label}>DD Number *</Text>
                        <TextInput
                          style={[styles.input, errors.ddNumber && styles.inputError]}
                          value={paymentData.ddNumber}
                          onChangeText={(text) => handleInputChange('ddNumber', text)}
                          placeholder="Enter DD number"
                        />
                        {errors.ddNumber && (
                          <Text style={styles.errorText}>{errors.ddNumber}</Text>
                        )}
                      </View>

                      <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.xs }]}>
                        <Text style={styles.label}>Bank Name *</Text>
                        <TextInput
                          style={[styles.input, errors.bankName && styles.inputError]}
                          value={paymentData.bankName}
                          onChangeText={(text) => handleInputChange('bankName', text)}
                          placeholder="Enter bank name"
                        />
                        {errors.bankName && (
                          <Text style={styles.errorText}>{errors.bankName}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}



          </View>
        </ScrollView>

        {/* Floating Pay Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedPaymentMethod || isProcessing) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedPaymentMethod || isProcessing}
        >
          <LinearGradient
            colors={colors.primaryGradient}
            style={styles.payButtonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.payButtonText}>{t('Confirm Payment')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Manual Payment Modal */}
        <Modal
          visible={showManualPaymentModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowManualPaymentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>MANUAL UTR Entry</Text>
                <TouchableOpacity onPress={() => setShowManualPaymentModal(false)}>
                  <Icon name="x" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.form, { paddingHorizontal: spacing.md }]}>
                  <View style={styles.infoBox}>
                    <Icon name="info" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                      Enter the UTR (Unique Transaction Reference) number from your bank transfer.
                      Your order will be processed after verification.
                    </Text>
                  </View>

                  <View style={[styles.infoBox, { alignItems: 'flex-start' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { marginBottom: 8, fontSize: 16 }]}>Bank Account Details (Transfer To)</Text>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>Bank Name</Text>
                        <Text style={[styles.infoText, { fontWeight: '600', color: colors.textPrimary }]}>{BANK_DETAILS.name}</Text>
                      </View>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>Account</Text>
                        <Text style={[styles.infoText, { fontWeight: '600', color: colors.textPrimary }]}>{BANK_DETAILS.accountNumber}</Text>
                      </View>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>IFSC</Text>
                        <Text style={[styles.infoText, { fontWeight: '600', color: colors.textPrimary }]}>{BANK_DETAILS.ifscCode}</Text>
                      </View>

                      <View style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>Branch</Text>
                        <Text style={[styles.infoText, { fontWeight: '600', color: colors.textPrimary }]}>{BANK_DETAILS.branch}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.manualPaymentAmount && styles.inputError,
                      ]}
                      value={paymentData.manualPaymentAmount}
                      onChangeText={(text) => handleInputChange('manualPaymentAmount', text.replace(/[^0-9.]/g, ''))}
                      placeholder="Enter amount paid"
                      keyboardType="numeric"
                    />
                    {errors.manualPaymentAmount && (
                      <Text style={styles.errorText}>{errors.manualPaymentAmount}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>UTR Number *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.utrNum && styles.inputError,
                      ]}
                      value={paymentData.utrNum}
                      onChangeText={(text) => handleInputChange('utrNum', text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Enter UTR number (e.g., ABC123456789)"
                      autoCapitalize="characters"
                      maxLength={18}
                    />
                    {errors.utrNum && (
                      <Text style={styles.errorText}>{errors.utrNum}</Text>
                    )}
                    <Text style={styles.helperText}>
                      UTR number is usually 9-18 alphanumeric characters found in your bank transaction receipt
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Transaction ID (Optional)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.transactionId && styles.inputError,
                      ]}
                      value={paymentData.transactionId}
                      onChangeText={(text) => handleInputChange('transactionId', text)}
                      placeholder="Enter bank transaction ID if separate from UTR"
                    />
                    {errors.transactionId && (
                      <Text style={styles.errorText}>{errors.transactionId}</Text>
                    )}
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.xs }]}>
                      <Text style={styles.label}>Bank Name *</Text>
                      <TextInput
                        style={[styles.input, errors.utrBankName && styles.inputError]}
                        value={paymentData.utrBankName}
                        onChangeText={(text) => handleInputChange('utrBankName', text)}
                        placeholder="Enter bank name"
                      />
                      {errors.utrBankName && (
                        <Text style={styles.errorText}>{errors.utrBankName}</Text>
                      )}
                    </View>

                    <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.xs }]}>
                      <Text style={styles.label}>Account Number</Text>
                      <TextInput
                        style={[styles.input, errors.utrAccountNumber && styles.inputError]}
                        value={paymentData.utrAccountNumber}
                        onChangeText={(text) => handleInputChange('utrAccountNumber', text.replace(/\D/g, ''))}
                        placeholder="Enter account number"
                        keyboardType="numeric"
                      />
                      {errors.utrAccountNumber && (
                        <Text style={styles.errorText}>{errors.utrAccountNumber}</Text>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowManualPaymentModal(false);
                    setSelectedPaymentMethod('');
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>{t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { padding: 0, overflow: 'hidden' }]}
                  onPress={() => {
                    if (validatePaymentData()) {
                      setShowManualPaymentModal(false);
                      // Auto-trigger payment after saving manual UTR
                      handlePayment();
                    }
                  }}
                >
                  <LinearGradient
                    colors={colors.primaryGradient}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={styles.modalButtonConfirmText}>{t('Send Details')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentScreen;



