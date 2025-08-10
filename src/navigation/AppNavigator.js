import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginScreen from '../screens/LoginScreen/index';
import SignupScreen from '../screens/SignupScreen/index';
import MainNavigator from './MainNavigator';
import ProductListing from '../screens/ProductListing/index';
import ProductDetail from '../screens/ProductDetail/index';
import Cart from '../screens/Cart/index';
import ProfileScreen from '../screens/ProfileScreen/index';
import NotificationsScreen from '../screens/NotificationsScreen/index';
import ChatScreen from '../screens/ChatScreen/index';
import TrackingScreen from '../screens/TrackingScreen/index';
import AppHeader from '../components/common/AppHeader';

const Stack = createStackNavigator();

// Wrapper components for screens that need AppHeader
const CartScreenWrapper = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <AppHeader 
      navigation={navigation}
      title="Cart"
      showBack={true}
    />
    <Cart navigation={navigation} />
    {/* Bottom Navigation Bar */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    }}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 0 }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          <TouchableOpacity 
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          >
            <Icon name="home" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Orders' })}
          >
            <Icon name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Updates' })}
          >
            <Icon name="chatbubble-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Updates</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  </View>
);

const ProfileScreenWrapper = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <AppHeader 
      navigation={navigation}
      title="Profile"
      showBack={true}
    />
    <ProfileScreen navigation={navigation} />
    {/* Bottom Navigation Bar */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    }}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 0 }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          <TouchableOpacity 
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          >
            <Icon name="home" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Orders' })}
          >
            <Icon name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Updates' })}
          >
            <Icon name="chatbubble-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Updates</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  </View>
);

const NotificationsScreenWrapper = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <AppHeader 
      navigation={navigation}
      title="Notifications"
      showBack={true}
    />
    <NotificationsScreen navigation={navigation} />
    {/* Bottom Navigation Bar */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    }}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 0 }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          <TouchableOpacity 
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          >
            <Icon name="home" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Orders' })}
          >
            <Icon name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Updates' })}
          >
            <Icon name="chatbubble-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Updates</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  </View>
 );

const ProductDetailWrapper = ({ navigation, route }) => (
  <View style={{ flex: 1 }}>
    <AppHeader 
      navigation={navigation}
      title={route.params?.product?.name || "Product Details"}
      showBack={true}
    />
    <ProductDetail navigation={navigation} route={route} />
    {/* Bottom Navigation Bar */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    }}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 0 }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          <TouchableOpacity 
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          >
            <Icon name="home" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Orders' })}
          >
            <Icon name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Updates' })}
          >
            <Icon name="chatbubble-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Updates</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  </View>
);

const ProductListingWrapper = ({ navigation, route }) => (
  <View style={{ flex: 1 }}>
    <AppHeader 
      navigation={navigation}
      title={route.params?.category?.name || "Products"}
      showBack={true}
    />
    <ProductListing navigation={navigation} route={route} />
    {/* Bottom Navigation Bar */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    }}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 0 }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          <TouchableOpacity 
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          >
            <Icon name="home" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Orders' })}
          >
            <Icon name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Updates' })}
          >
            <Icon name="chatbubble-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Updates</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  </View>
);

const ChatScreenWrapper = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <AppHeader 
      navigation={navigation}
      title="Customer Support"
      showBack={true}
    />
    <ChatScreen navigation={navigation} />
    {/* Bottom Navigation Bar */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    }}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 0 }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          >
            <Icon name="home" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Orders' })}
          >
            <Icon name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Updates' })}
          >
            <Icon name="chatbubble-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Updates</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  </View>
);

const TrackingScreenWrapper = ({ navigation, route }) => (
  <View style={{ flex: 1 }}>
    <AppHeader 
      navigation={navigation}
      title="Track Order"
      showBack={true}
    />
    <TrackingScreen navigation={navigation} route={route} />
    {/* Bottom Navigation Bar */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
    }}>
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 0 }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          >
            <Icon name="home" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Orders' })}
          >
            <Icon name="document-text-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('MainApp', { screen: 'Updates' })}
          >
            <Icon name="chatbubble-outline" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 2 }}>Updates</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  </View>
);

const AppNavigator = () => {
  return (
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainApp" component={MainNavigator} />
        <Stack.Screen name="ProductListing" component={ProductListingWrapper} />
        <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
        <Stack.Screen name="Cart" component={CartScreenWrapper} />
        <Stack.Screen name="Profile" component={ProfileScreenWrapper} />
        <Stack.Screen name="Notifications" component={NotificationsScreenWrapper} />
        <Stack.Screen name="Chat" component={ChatScreenWrapper} />
        <Stack.Screen name="TrackingScreen" component={TrackingScreenWrapper} />
      </Stack.Navigator>
  );
};

export default AppNavigator;
