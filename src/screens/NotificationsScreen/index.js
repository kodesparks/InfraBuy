import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import Skeleton from '../../components/common/Skeleton';
import { useTranslation } from 'react-i18next';
import createStyles from '../../assets/styles/notifications';
import { useTheme } from '../../context/ThemeContext';

const NotificationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [notifications] = useState([
    {
      id: 1,
      title: t('Order Confirmed'),
      message: t('Your order #12345 has been confirmed and is being processed.'),
      time: t('2 hours ago'),
      type: 'order',
      read: false
    },
    {
      id: 2,
      title: t('Delivery Update'),
      message: t('Your cement order will be delivered tomorrow between 10 AM - 2 PM.'),
      time: t('1 day ago'),
      type: 'delivery',
      read: false
    },
    {
      id: 3,
      title: t('Price Drop Alert'),
      message: t('Iron rods price has dropped by 5%. Check out the new prices!'),
      time: t('2 days ago'),
      type: 'price',
      read: true
    },
    {
      id: 4,
      title: t('New Product Available'),
      message: t('We have added new construction materials to our inventory.'),
      time: t('3 days ago'),
      type: 'product',
      read: true
    },
    {
      id: 5,
      title: t('Payment Successful'),
      message: t('Payment of ₹10,200 for order #12344 has been processed successfully.'),
      time: t('1 week ago'),
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
        { text: t('OK'), onPress: () => console.log('Notification pressed') }
      ]
    );
  };

  const handleMarkAllRead = () => {
    Alert.alert(t('Success'), t('All notifications marked as read'));
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

  const renderNotificationsSkeleton = () => {
    return (
      <View style={styles.notificationsContainer}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={styles.notificationItem}>
            <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Skeleton width="40%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="90%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="30%" height={12} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        {renderNotificationsSkeleton()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.notificationsContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NotificationsScreen;

