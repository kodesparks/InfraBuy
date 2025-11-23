import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/index';
import OrdersScreen from '../screens/OrdersScreen/index';
import UpdatesScreen from '../screens/UpdatesScreen/index';
import ProfileScreen from '../screens/ProfileScreen/index';

import { colors } from '../assets/styles/global';
import AppHeader from '../components/common/AppHeader';
import { useAppContext } from '../context/AppContext';

const Tab = createBottomTabNavigator();

// Wrapper components to include AppHeader on each screen
const HomeScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title="infraXpert"
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

const ProfileScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title="Profile"
        showBack={true}
        cartCount={cartCount}
      />
      <ProfileScreen navigation={navigation} />
    </View>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Updates') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          }

          return (
            <View style={{ alignItems: 'center' }}>
              <Icon 
                name={iconName} 
                size={24} 
                color={focused ? colors.white : colors.white} 
              />
            </View>
          );
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.white,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingVertical: 6,
          paddingHorizontal: 20,
          height: 60,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#723FED', '#3B58EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          color: colors.white,
        },
        headerShown: false,
      })}
    >
        <Tab.Screen 
          name="Home" 
          component={HomeScreenWrapper}
          options={{
            tabBarLabel: 'Home',
          }}
        />

        <Tab.Screen 
          name="Orders" 
          component={OrdersScreenWrapper}
          options={{
            tabBarLabel: 'Orders',
          }}
        />
        <Tab.Screen 
          name="Updates" 
          component={UpdatesScreenWrapper}
          options={{
            tabBarLabel: 'Updates',
          }}
        />
    </Tab.Navigator>
  );
};

export default MainNavigator; 