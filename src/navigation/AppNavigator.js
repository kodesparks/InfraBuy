import React from 'react';
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
import SupportScreen from '../screens/SupportScreen/index';
import TrackingScreen from '../screens/TrackingScreen/index';
import DeliveryDetails from '../screens/DeliveryDetails/index';
import AppHeader from '../components/common/AppHeader';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

// Wrapper components for screens that need AppHeader
const CartScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title="Cart"
        showBack={true}
        cartCount={cartCount}
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
};

const NotificationsScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title="Notifications"
        showBack={true}
        cartCount={cartCount}
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
};

const ProductDetailWrapper = ({ navigation, route }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title={route.params?.product?.name || "Product Details"}
        showBack={true}
        cartCount={cartCount}
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
};

const ProductListingWrapper = ({ navigation, route }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title={route.params?.category?.name || "Products"}
        showBack={true}
        cartCount={cartCount}
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
};

const ChatScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title="Customer Support"
        showBack={true}
        cartCount={cartCount}
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
};

const DeliveryDetailsWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title="Delivery Details"
        showBack={true}
        cartCount={cartCount}
      />
      <DeliveryDetails navigation={navigation} />
    </View>
  );
};

const TrackingScreenWrapper = ({ navigation, route }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        navigation={navigation}
        title="Track Order"
        showBack={true}
        cartCount={cartCount}
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
};

const SupportScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  return (
    <View style={{ flex: 1 }}>
      <SupportScreen navigation={navigation} />
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
};

const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#723FED' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isLoggedIn ? "MainApp" : "Login"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainApp" component={MainNavigator} />
      <Stack.Screen name="ProductListing" component={ProductListingWrapper} />
      <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
      <Stack.Screen name="Cart" component={CartScreenWrapper} />
      <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsWrapper} />
      <Stack.Screen name="Profile" component={ProfileScreenWrapper} />
      <Stack.Screen name="Notifications" component={NotificationsScreenWrapper} />
      <Stack.Screen name="Support" component={SupportScreenWrapper} />
      <Stack.Screen name="Chat" component={ChatScreenWrapper} />
      <Stack.Screen name="TrackingScreen" component={TrackingScreenWrapper} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
