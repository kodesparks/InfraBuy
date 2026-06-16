import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { spacing, borderRadius, shadows } from '../../assets/styles/global';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

const AppHeader = ({
  navigation,
  title = 'InfraExpert',
  showBack = false,
  onMenuPress,
  onNotificationPress,
  onHelpPress,
  onCartPress,
  cartCount: propCartCount,
  notificationCount = 0
}) => {
  const { markNotificationAsRead, cartCount: contextCartCount } = useAppContext();
  // Always use context cartCount for immediate updates (prop is kept for backward compatibility but ignored)
  const cartCount = contextCartCount || 0;

  const { t, i18n } = useTranslation();
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      // Default behavior - open profile when sidebar icon is pressed
      if (showBack) {
        navigation.goBack();
      } else {
        // Open profile when sidebar icon is pressed
        navigation.navigate('Profile');
      }
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      // Mark notification as read and navigate
      markNotificationAsRead();
      navigation.navigate('Notifications');
    }
  };

  const handleHelpPress = () => {
    if (onHelpPress) {
      onHelpPress();
    } else {
      // Navigate to Support screen
      navigation.navigate('Support');
    }
  };


  const handleCartPress = () => {
    if (onCartPress) {
      onCartPress();
    } else {
      navigation.navigate('Cart');
    }
  };

  // Dynamic styles defined inline with access to dynamic `colors`
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background, // Solid background to prevent overlap
      elevation: 4, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      zIndex: 1000,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      minHeight: 56, // Thinner premium height for mobile navigation
    },
    floatingButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    logoPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor: isDarkMode ? '#E2E8F0' : 'transparent',
    },
    logoImage: {
      height: 22,
      width: 95,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6, // Increased gap for better breathing room
      justifyContent: 'flex-end',
    },
    headerIcon: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartContainer: {
      position: 'relative',
    },
    cartBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: '#FF3B30', // Vibrant bubble red
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      borderWidth: 1.5,
      borderColor: colors.background, // Match container background for premium cutout look
    },
    cartBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    notificationContainer: {
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: '#FF3B30',
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      borderWidth: 1.5,
      borderColor: colors.background,
    },
    notificationBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: 'transparent' }} edges={['top']}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.floatingButton} 
            onPress={handleMenuPress}
            activeOpacity={0.8}
          >
            <Icon
              name={showBack ? "arrow-back" : "menu-outline"}
              size={20}
              color={isDarkMode ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>

          <View style={styles.logoPill}>
            <Image
              source={require('../../assets/images/logo_new.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.floatingButton} 
              onPress={toggleLanguage}
              activeOpacity={0.8}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000', fontWeight: '800', fontSize: 10 }}>
                  {i18n.language === 'en' ? 'EN' : 'TE'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.floatingButton} 
              onPress={() => toggleTheme(isDarkMode ? 'light' : 'dark')}
              activeOpacity={0.8}
            >
              <Icon 
                name={isDarkMode ? "sunny-outline" : "moon-outline"} 
                size={18} 
                color={isDarkMode ? "#FFFFFF" : "#000000"} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.floatingButton} 
              onPress={handleHelpPress}
              activeOpacity={0.8}
            >
              <Icon name="chatbubble-outline" size={18} color={isDarkMode ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.floatingButton} 
              onPress={handleNotificationPress}
              activeOpacity={0.8}
            >
              <View style={styles.notificationContainer}>
                <Icon name="notifications-outline" size={20} color={isDarkMode ? "#FFFFFF" : "#000000"} />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.floatingButton} 
              onPress={handleCartPress}
              activeOpacity={0.8}
            >
              <View style={styles.cartContainer}>
                <Icon name="cart-outline" size={20} color={isDarkMode ? "#FFFFFF" : "#000000"} />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AppHeader;
