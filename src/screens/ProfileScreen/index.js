import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import styles from '../../assets/styles/profile';

const ProfileScreen = ({ navigation }) => {
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: '123 Construction Street, Mumbai, Maharashtra'
  });

  const menuItems = [
    {
      id: 1,
      title: 'Personal Information',
      icon: '👤',
      action: () => Alert.alert('Info', 'Edit personal information')
    },
    {
      id: 2,
      title: 'Order History',
      icon: '📋',
      action: () => Alert.alert('Orders', 'View order history')
    },
    {
      id: 3,
      title: 'Saved Addresses',
      icon: '📍',
      action: () => Alert.alert('Addresses', 'Manage saved addresses')
    },
    {
      id: 4,
      title: 'Payment Methods',
      icon: '💳',
      action: () => Alert.alert('Payment', 'Manage payment methods')
    },
    {
      id: 5,
      title: 'Settings',
      icon: '⚙️',
      action: () => Alert.alert('Settings', 'App settings')
    },
    {
      id: 6,
      title: 'Help & Support',
      icon: '❓',
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
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.headerIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImage}>👤</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuArrow}>▶</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen; 