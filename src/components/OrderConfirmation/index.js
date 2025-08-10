import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import styles from '../../assets/styles/orderConfirmation';

const OrderConfirmation = ({ visible, onClose, onContinueShopping, orderDetails }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={60} color="#10B981" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Thank you!</Text>

          {/* Message */}
          <Text style={styles.message}>
            Your order has been placed successfully! Our representative will contact you soon.
          </Text>

          {/* Order Summary */}
          {orderDetails && (
            <View style={styles.orderSummary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <Text style={styles.summaryText}>
                Total Items: {orderDetails.items?.length || 0}
              </Text>
              <Text style={styles.summaryText}>
                Total Amount: ₹{orderDetails.total?.toLocaleString() || '0'}
              </Text>
            </View>
          )}

          {/* Continue Shopping Button */}
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.continueButton}
          >
            <TouchableOpacity 
              style={styles.continueButtonInner}
              onPress={onContinueShopping}
            >
              <Icon name="shopping-bag" size={20} color="white" />
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default OrderConfirmation; 