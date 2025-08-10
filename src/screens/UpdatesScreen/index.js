import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';

const UpdatesScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Orders', 'Offers'];

  const updates = [
    {
      id: 1,
      type: 'Orders',
      title: 'Order Delivered Successfully',
      description: 'Your order #ORD001 of UltraTech Cement has been delivered to your site.',
      action: 'View Details',
      actionColor: '#3B82F6',
      timestamp: '2 hours ago',
      icon: 'truck',
      iconBgColor: '#10B981',
    },
    {
      id: 2,
      type: 'Offers',
      title: 'Special Discount Available',
      description: 'Get 15% off on ACC Cement. Limited time offer valid till 31st Jan.',
      action: 'View Offer',
      actionColor: '#F59E0B',
      timestamp: '5 hours ago',
      icon: 'tag',
      iconBgColor: '#F97316',
    },
    {
      id: 3,
      type: 'Orders',
      title: 'Back in Stock',
      description: 'JSW Steel rods are now available. Place your order now!',
      action: 'View Details',
      actionColor: '#3B82F6',
      timestamp: '1 day ago',
      icon: 'package',
      iconBgColor: '#60A5FA',
    },
  ];

  const filteredUpdates = activeFilter === 'All' 
    ? updates 
    : updates.filter(update => update.type === activeFilter);

  const renderLatestUpdatesCard = () => (
    <View style={styles.latestUpdatesCard}>
      <View style={styles.latestUpdatesContent}>
        <View>
          <Text style={styles.latestUpdatesTitle}>Latest Updates</Text>
          <Text style={styles.latestUpdatesSubtitle}>
            Stay informed about your orders and offers
          </Text>
        </View>
        <View style={styles.latestUpdatesIcon}>
          <Icon name="file-text" size={20} color="#3B82F6" />
        </View>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            activeFilter === filter && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(filter)}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === filter && styles.filterButtonTextActive
          ]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderUpdateCard = (update) => (
    <View key={update.id} style={styles.updateCard}>
      <View style={styles.updateCardHeader}>
        <View style={[styles.updateIconContainer, { backgroundColor: update.iconBgColor }]}>
          <Icon name={update.icon} size={20} color="white" />
        </View>
        <View style={styles.updateNotificationDot} />
      </View>
      
      <View style={styles.updateCardContent}>
        <Text style={styles.updateTitle}>{update.title}</Text>
        <Text style={styles.updateDescription}>{update.description}</Text>
        
        <View style={styles.updateCardFooter}>
          <Text style={styles.updateTimestamp}>{update.timestamp}</Text>
          <TouchableOpacity
            style={[styles.actionLink, { color: update.actionColor }]}
            onPress={() => handleUpdateAction(update)}
          >
            <Text style={[styles.actionLinkText, { color: update.actionColor }]}>
              {update.action}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleUpdateAction = (update) => {
    if (update.type === 'Orders') {
      navigation.navigate('OrdersScreen');
    } else if (update.type === 'Offers') {
      navigation.navigate('ProductListing', { category: 'Cement' });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderLatestUpdatesCard()}
        {renderFilterButtons()}
        
        <View style={styles.updatesContainer}>
          {filteredUpdates.map(renderUpdateCard)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  latestUpdatesCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  latestUpdatesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  latestUpdatesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xs,
  },
  latestUpdatesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  latestUpdatesIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  updatesContainer: {
    gap: spacing.md,
  },
  updateCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  updateCardHeader: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  updateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateNotificationDot: {
    position: 'absolute',
    top: -2,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  updateCardContent: {
    marginLeft: 50,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  updateDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  updateCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionLink: {
    paddingVertical: spacing.xs,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UpdatesScreen;
