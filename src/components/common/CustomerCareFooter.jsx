import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, shadows } from '../../assets/styles/global';
import { useTheme } from '../../context/ThemeContext';

const CUSTOMER_CARE_NUMBER = '9000390909';

const CustomerCareFooter = ({ style }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(colors, insets), [colors, insets]);

  const handleCallPress = () => {
    Linking.openURL(`tel:${CUSTOMER_CARE_NUMBER}`).catch(err => {
      console.error('Error opening phone:', err);
    });
  };

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleCallPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <Icon name="call" size={28} color={colors.white || '#FFFFFF'} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors, insets) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? insets.bottom + 140 : 150, // Pushed up for clear Nav Bar gap
    right: spacing.lg,
    zIndex: 999,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    ...shadows.cloud,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomerCareFooter;


