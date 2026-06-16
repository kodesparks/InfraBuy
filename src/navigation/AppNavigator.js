import React from 'react';
import { colors as staticColors } from '../assets/styles/global';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import Skeleton from '../components/common/Skeleton';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginScreen from '../screens/LoginScreen/index';
import SignupScreen from '../screens/SignupScreen/index';
import VerifyEmailScreen from '../screens/VerifyEmailScreen/index';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/index';
import ResetPasswordScreen from '../screens/ResetPasswordScreen/index';
import MainNavigator from './MainNavigator';
import ProductListing from '../screens/ProductListing/index';
import ProductDetail from '../screens/ProductDetail/index';
import Cart from '../screens/Cart/index';
import ProfileScreen from '../screens/ProfileScreen/index';
import NotificationsScreen from '../screens/NotificationsScreen/index';
import ChatScreen from '../screens/ChatScreen/index';
import SupportScreen from '../screens/SupportScreen/index';
import TrackingScreen from '../screens/TrackingScreen/index';
import PaymentScreen from '../screens/PaymentScreen/index';
import AppHeader from '../components/common/AppHeader';
import FloatingTabBar from '../components/common/FloatingTabBar';
import CartFloatingPill from '../components/common/CartFloatingPill';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

// Wrapper components for screens that need AppHeader
const CartScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title={t("Enquiry")}
        showBack={true}
        cartCount={cartCount}
      />
      <Cart navigation={navigation} />
    </View>
  );
};

const ProfileScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title={t("Profile")}
        showBack={true}
        cartCount={cartCount}
      />
      <ProfileScreen navigation={navigation} />
      <FloatingTabBar navigation={navigation} />
    </View>
  );
};

const NotificationsScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title={t("Notifications")}
        showBack={true}
        cartCount={cartCount}
      />
      <NotificationsScreen navigation={navigation} />
      <FloatingTabBar navigation={navigation} />
    </View>
  );
};

const ProductDetailWrapper = ({ navigation, route }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title={route.params?.product?.name || t("Product Details")}
        showBack={true}
        cartCount={cartCount}
      />
      <ProductDetail navigation={navigation} route={route} />
      <FloatingTabBar navigation={navigation} />
      <CartFloatingPill 
        navigation={navigation} 
        isVisible={true} 
      />
    </View>
  );
};

const ProductListingWrapper = ({ navigation, route }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title={route.params?.category?.name || t("Products")}
        showBack={true}
        cartCount={cartCount}
      />
      <ProductListing navigation={navigation} route={route} />
      <FloatingTabBar navigation={navigation} />
      <CartFloatingPill 
        navigation={navigation} 
        isVisible={true} 
      />
    </View>
  );
};

const ChatScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title={t("Customer Support")}
        showBack={true}
        cartCount={cartCount}
      />
      <ChatScreen navigation={navigation} />
      <FloatingTabBar navigation={navigation} />
    </View>
  );
};

const PaymentScreenWrapper = ({ navigation, route }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <PaymentScreen navigation={navigation} route={route} />
    </View>
  );
};

const TrackingScreenWrapper = ({ navigation, route }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        navigation={navigation}
        title={t("Track Order")}
        showBack={true}
        cartCount={cartCount}
      />
      <TrackingScreen navigation={navigation} route={route} />
      <FloatingTabBar navigation={navigation} />
    </View>
  );
};

const SupportScreenWrapper = ({ navigation }) => {
  const { cartCount } = useAppContext();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <SupportScreen navigation={navigation} />
      <FloatingTabBar navigation={navigation} />
    </View>
  );
};

const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const { isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0F1115' : '#F9F9F9' }}>
        <View style={{ padding: 20, paddingTop: 100 }}>
          <Skeleton width="100%" height={200} borderRadius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="60%" height={30} borderRadius={6} style={{ marginBottom: 40 }} />
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <View key={i} style={{ width: '31%', marginBottom: 20 }}>
                <Skeleton width="100%" height={120} borderRadius={16} />
              </View>
            ))}
          </View>
        </View>
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
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="MainApp" component={MainNavigator} />
      <Stack.Screen name="ProductListing" component={ProductListingWrapper} />
      <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
      <Stack.Screen name="Cart" component={CartScreenWrapper} />
      <Stack.Screen name="Payment" component={PaymentScreenWrapper} />
      <Stack.Screen name="Profile" component={ProfileScreenWrapper} />
      <Stack.Screen name="Notifications" component={NotificationsScreenWrapper} />
      <Stack.Screen name="Support" component={SupportScreenWrapper} />
      <Stack.Screen name="Chat" component={ChatScreenWrapper} />
      <Stack.Screen name="TrackingScreen" component={TrackingScreenWrapper} />
    </Stack.Navigator>
  );
};

export default AppNavigator;



