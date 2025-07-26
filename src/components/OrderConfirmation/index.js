import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styles from '../../assets/styles/orderConfirmation';

const OrderConfirmation = ({ visible, onClose, onContinueShopping }) => {
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
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🤝</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Thank you!</Text>

          {/* Message */}
          <Text style={styles.message}>
            Thanks for reaching out to us! Our rep will reach out to you.
          </Text>

          {/* Continue Shopping Button */}
          <TouchableOpacity style={styles.continueButton} onPress={onContinueShopping}>
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OrderConfirmation; 