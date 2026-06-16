import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import styles from '../../assets/styles/addToCartSuccessModal';

const AddToCartSuccessModal = ({ visible, onClose, onContinueShopping, onViewCart, productName, quantity, unit }) => {
  const { t } = useTranslation();
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

          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name="check-circle" size={64} color="#10B981" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Item Added to Enquiry!</Text>

          {/* Message */}
          <Text style={styles.message}>
            {productName} ({quantity} {unit}) {t('has been added to your enquiry list successfully.')}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Continue Shopping Button */}
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={onContinueShopping}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>

            {/* View Cart Button */}
            <LinearGradient
              colors={colors.primaryGradient}
              style={styles.viewCartButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                style={styles.viewCartButtonInner}
                onPress={onViewCart}
              >
                <Icon name="shopping-cart" size={18} color="white" />
                <Text style={styles.viewCartText}>View Enquiry</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddToCartSuccessModal;



