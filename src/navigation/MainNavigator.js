import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen/index';
import ShopScreen from '../screens/ShopScreen/index';
import { colors } from '../assets/styles/global';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = '🏠';
          } else if (route.name === 'Shop') {
            iconName = '🛍️';
          }

          return (
            <Text style={{ 
              fontSize: 24, 
              color: focused ? colors.primary : colors.darkGray 
            }}>
              {iconName}
            </Text>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.lightGray,
          paddingVertical: 10,
          paddingHorizontal: 20,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Shop" 
        component={ShopScreen}
        options={{
          tabBarLabel: 'Shop',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator; 