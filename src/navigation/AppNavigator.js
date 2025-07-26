import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen/index';
import SignupScreen from '../screens/SignupScreen/index';
import MainNavigator from './MainNavigator';
import ProductListing from '../screens/ProductListing/index';
import ProductDetail from '../screens/ProductDetail/index';
import Cart from '../screens/Cart/index';
import ProfileScreen from '../screens/ProfileScreen/index';
import NotificationsScreen from '../screens/NotificationsScreen/index';
import ChatScreen from '../screens/ChatScreen/index';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainApp" component={MainNavigator} />
        <Stack.Screen name="ProductListing" component={ProductListing} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
  );
};

export default AppNavigator;
