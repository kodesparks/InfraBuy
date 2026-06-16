import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CartFloatingPill = ({ navigation, isVisible = true }) => {
  const { cartCount } = useAppContext();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const shouldShow = isVisible && cartCount > 0;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shouldShow]);

  // Don't render anything if it's not supposed to be visible AND animation is at 0
  if (!shouldShow && fadeAnim._value === 0) return null;

  return (
    <Animated.View 
      pointerEvents={shouldShow ? 'auto' : 'none'}
      style={[
        styles.container,
        { 
          bottom: Platform.OS === 'ios' ? insets.bottom + 140 : 150, // Pushed up for clear Nav Bar gap
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.9}
        style={styles.pillWrapper}
      >
        <LinearGradient
          colors={['#3B0764', '#EA580C']} // Even darker Violet to richer Orange transition
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pill}
        >
          {/* Glossy Shine Effect Overlay */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)', 'transparent']}
            style={styles.glossyShine}
          />
          <View style={styles.pillContent}>
            <View style={styles.leftSection}>
              <View style={styles.cartIconBadge}>
                <Icon name="shopping-cart" size={18} color="white" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              </View>
              <Text style={styles.pillText}>{t('View Enquiry')}</Text>
            </View>
            <Icon name="arrow-right" size={20} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999, // Ensure it's above everything
  },
  pillWrapper: {
    borderRadius: 30,
    backgroundColor: 'transparent',
    // The "Cloud Shadow" Spec: Y: 12px, Blur: 24px, Opacity: 0.06
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    // Elevation for Android
    elevation: 8,
    overflow: 'visible', // Allow shadow to spread
  },
  pill: {
    paddingHorizontal: 20,
    height: 60, // Match Call button height
    borderRadius: 30,
    minWidth: 190,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden', // CRITICAL: Clips shine and gradient to pill shape
    backgroundColor: '#4E5DF2', // Fallback for transition
    justifyContent: 'center', // Center content vertically
  },
  glossyShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 1,
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2, // Above shine
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconBadge: {
    position: 'relative',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#3B0764', // Deepened to match the darker violet end of the gradient
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
  },
  pillText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default CartFloatingPill;
