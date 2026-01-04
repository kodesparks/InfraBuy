import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';

const AppHeader = ({ 
  navigation, 
  title = 'infraXpert', 
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

  return (
    <SafeAreaView style={styles.container} edges={['top']} mode="margin">
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primaryLight}
        translucent={false}
      />
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Icon 
            name={showBack ? "arrow-back" : "menu-outline"} 
            size={24} 
            color={colors.white} 
          />
        </TouchableOpacity>
        
        {title === 'infraXpert' ? (
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Text style={styles.headerTitle}>{title}</Text>
        )}
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleHelpPress}>
            <Icon name="chatbubble-outline" size={20} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIcon} onPress={handleNotificationPress}>
            <View style={styles.notificationContainer}>
              <Icon name="notifications-outline" size={20} color={colors.white} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIcon} onPress={handleCartPress}>
            <View style={styles.cartContainer}>
              <Icon name="cart-outline" size={20} color={colors.white} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 60,
  },
  menuButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.accentWarning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.accentWarning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    
    // marginLeft: spacing.sm,
  },
  logoImage: {
    marginTop: 20,
    width: 200,
    height: 130,
  },
});

export default AppHeader;
