import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const FloatingTabBar = ({ state, descriptors, navigation, activeRouteName }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  // If used as a custom component for Tab.Navigator
  if (state && descriptors && navigation) {
    return (
      <View style={[styles.floatingContainer, { bottom: Platform.OS === 'ios' ? insets.bottom + 20 : 25 }]}>
        <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            let iconName;
            if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
            else if (route.name === 'Orders') iconName = isFocused ? 'document-text' : 'document-text-outline';
            else if (route.name === 'Updates') iconName = isFocused ? 'chatbubble' : 'chatbubble-outline';

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Icon
                  name={iconName}
                  size={24}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.label,
                  { color: isFocused ? colors.primary : colors.textSecondary }
                ]}>
                  {t(label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // If used as a standalone component in AppNavigator wrappers
  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { name: 'Orders', label: 'Orders', icon: 'document-text', iconOutline: 'document-text-outline' },
    { name: 'Updates', label: 'Updates', icon: 'chatbubble', iconOutline: 'chatbubble-outline' },
  ];

  return (
    <View style={[styles.floatingContainer, { bottom: Platform.OS === 'ios' ? insets.bottom + 20 : 25 }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {tabs.map((tab) => {
          const isFocused = activeRouteName === tab.name;
          const iconName = isFocused ? tab.icon : tab.iconOutline;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate('MainApp', { screen: tab.name })}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.label,
                { color: isFocused ? colors.primary : colors.textSecondary }
              ]}>
                {t(tab.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    width: width - 50,
    height: 70,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    // The "Glass & Tonal Layering" Spec: 
    // 90% Opacity (Glass-like) fallback as blur isn't native to View
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    
    // The "Cloud Shadow" Spec: Y: 12px, Blur: 24px, Opacity: 0.06
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    // Elevation for Android
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default FloatingTabBar;
