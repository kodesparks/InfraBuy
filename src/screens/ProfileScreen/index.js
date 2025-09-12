import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import styles from '../../assets/styles/profile';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  // Use real user data from AuthContext, fallback to dummy data
  const userData = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    address: '123 Construction Street, Mumbai, Maharashtra',
    pincode: '400001',
    role: 'customer',
    accessLevel: 'app_web',
    permissions: ['app_access', 'web_access'],
    isPhoneVerified: false,
    isEmailVerified: false,
    isActive: true
  };

  const menuItems = [
    {
      id: 1,
      title: 'Personal Information',
      icon: 'user',
      action: () => Alert.alert('Info', 'Edit personal information')
    },
    {
      id: 2,
      title: 'Order History',
      icon: 'file-text',
      action: () => Alert.alert('Orders', 'View order history')
    },
    {
      id: 3,
      title: 'Saved Addresses',
      icon: 'map-pin',
      action: () => Alert.alert('Addresses', 'Manage saved addresses')
    },
    {
      id: 4,
      title: 'Payment Methods',
      icon: 'credit-card',
      action: () => Alert.alert('Payment', 'Manage payment methods')
    },
    {
      id: 5,
      title: 'Settings',
      icon: 'settings',
      action: () => Alert.alert('Settings', 'App settings')
    },
    {
      id: 6,
      title: 'Help & Support',
      icon: 'help-circle',
      action: () => Alert.alert('Support', 'Contact support team')
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'You have been successfully logged out'
              });
              navigation.navigate('Login');
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'Something went wrong. Please try again.'
              });
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Icon name="user" size={50} color="#6B7280" />
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.userPhone}>{userData.phone}</Text>
          <Text style={styles.userAddress}>{userData.address}</Text>
          <Text style={styles.userPincode}>Pincode: {userData.pincode}</Text>
          
          {/* Verification Status */}
          <View style={styles.verificationStatus}>
            <View style={styles.verificationItem}>
              <Icon 
                name={userData.isEmailVerified ? "check-circle" : "x-circle"} 
                size={16} 
                color={userData.isEmailVerified ? "#10B981" : "#EF4444"} 
              />
              <Text style={[styles.verificationText, { color: userData.isEmailVerified ? "#10B981" : "#EF4444" }]}>
                Email {userData.isEmailVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
            <View style={styles.verificationItem}>
              <Icon 
                name={userData.isPhoneVerified ? "check-circle" : "x-circle"} 
                size={16} 
                color={userData.isPhoneVerified ? "#10B981" : "#EF4444"} 
              />
              <Text style={[styles.verificationText, { color: userData.isPhoneVerified ? "#10B981" : "#EF4444" }]}>
                Phone {userData.isPhoneVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemIconContainer}>
                <Icon name={item.icon} size={22} color="#3B82F6" />
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen; 