import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/index';
import OrdersScreen from '../screens/OrdersScreen/index';
import UpdatesScreen from '../screens/UpdatesScreen/index';
import ProfileScreen from '../screens/ProfileScreen/index';

import AppHeader from '../components/common/AppHeader';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import FloatingTabBar from '../components/common/FloatingTabBar';
import CartFloatingPill from '../components/common/CartFloatingPill';

const Tab = createBottomTabNavigator();

// Wrapper components to include AppHeader on each screen
const HomeScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title="InfraExpert"
        cartCount={cartCount}
      />
      <HomeScreen navigation={navigation} />
    </View>
  );
};

const OrdersScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title="Orders"
        cartCount={cartCount}
      />
      <OrdersScreen navigation={navigation} />
    </View>
  );
};

const UpdatesScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title="Updates"
        cartCount={cartCount}
      />
      <UpdatesScreen navigation={navigation} />
    </View>
  );
};

const MainNavigator = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          tabBarLabel: t('Home'),
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreenWrapper}
        options={{
          tabBarLabel: t('Orders'),
        }}
      />
      <Tab.Screen
        name="Updates"
        component={UpdatesScreenWrapper}
        options={{
          tabBarLabel: t('Updates'),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;


