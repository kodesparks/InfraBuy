import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Alert } from 'react-native';
import styles from '../../assets/styles/notifications';

const NotificationsScreen = ({ navigation }) => {
  const [notifications] = useState([
    {
      id: 1,
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed and is being processed.',
      time: '2 hours ago',
      type: 'order',
      read: false
    },
    {
      id: 2,
      title: 'Delivery Update',
      message: 'Your cement order will be delivered tomorrow between 10 AM - 2 PM.',
      time: '1 day ago',
      type: 'delivery',
      read: false
    },
    {
      id: 3,
      title: 'Price Drop Alert',
      message: 'Iron rods price has dropped by 5%. Check out the new prices!',
      time: '2 days ago',
      type: 'price',
      read: true
    },
    {
      id: 4,
      title: 'New Product Available',
      message: 'We have added new construction materials to our inventory.',
      time: '3 days ago',
      type: 'product',
      read: true
    },
    {
      id: 5,
      title: 'Payment Successful',
      message: 'Payment of ₹10,200 for order #12344 has been processed successfully.',
      time: '1 week ago',
      type: 'payment',
      read: true
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'delivery':
        return '🚚';
      case 'price':
        return '💰';
      case 'product':
        return '🆕';
      case 'payment':
        return '💳';
      default:
        return '🔔';
    }
  };

  const handleNotificationPress = (notification) => {
    Alert.alert(
      notification.title,
      notification.message,
      [
        { text: 'OK', onPress: () => console.log('Notification pressed') }
      ]
    );
  };

  const handleMarkAllRead = () => {
    Alert.alert('Success', 'All notifications marked as read');
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{getNotificationIcon(item.type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleMarkAllRead}>
            <Text style={styles.headerIconText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.headerIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.notificationsContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen; 