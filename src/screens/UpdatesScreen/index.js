import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Feather';
import { spacing, borderRadius, shadows } from '../../assets/styles/global';
import { useTheme } from '../../context/ThemeContext';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';

const UpdatesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [t('All'), t('Tenders'), t('Offers')];
  const updateGradientColors = ['#FF9D2E', '#3B82F6', '#723FED']; // Orange, Blue, Violet

  const updates = [
    {
      id: 1,
      type: t('Offers'),
      title: t('Special Discount Available'),
      description: t('Please contact InfraExpert sales team to get special offers - 9000390909'),
      action: t('View Offer'),
      actionColor: '#F59E0B',
      timestamp: t('5 hours ago'),
      icon: 'tag',
      iconBgColor: '#F97316',
    },
    {
      id: 2,
      type: t('Tenders'),
      title: t('New Tender Opportunity'),
      description: t('Updates will come soon !'),
      action: t('View Tender'),
      actionColor: '#8B5CF6',
      timestamp: t('3 hours ago'),
      icon: 'briefcase',
      iconBgColor: '#8B5CF6',
    },
    {
      id: 3,
      type: t('Tenders'),
      title: t('Tender Completed'),
      description: t('Updates will come soon !'),
      action: t('View Details'),
      actionColor: '#8B5CF6',
      timestamp: t('2 days ago'),
      icon: 'check-circle',
      iconBgColor: '#10B981',
    },
    {
      id: 4,
      type: t('Offers'),
      title: t('Back in Stock'),
      description: t('Updates will come soon !'),
      action: t('View Details'),
      actionColor: '#3B82F6',
      timestamp: t('1 day ago'),
      icon: 'package',
      iconBgColor: '#60A5FA',
    },
  ];

  const filteredUpdates = activeFilter === t('All')
    ? updates
    : updates.filter(update => update.type === activeFilter);

  const renderLatestUpdatesCard = () => (
    <View style={styles.latestUpdatesCard}>
      <View style={styles.latestUpdatesContent}>
        <View>
          <Text style={styles.latestUpdatesTitle}>{t('Latest Updates')}</Text>
          <Text style={styles.latestUpdatesSubtitle}>
            {t('Stay informed about your orders and offers')}
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
    <LinearGradient
      key={update.id}
      colors={updateGradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.updateBorderWrapper}
    >
      <View style={styles.updateCard}>
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
    </LinearGradient>
  );

  const handleUpdateAction = (update) => {
    if (update.type === t('Offers')) {
      navigation.navigate('ProductListing', { category: 'Cement' });
    } else if (update.type === t('Tenders')) {
      navigation.navigate('MainApp');
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

      <CustomerCareFooter />
    </View>
  );
};

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 95,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  latestUpdatesCard: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.cloud,
    borderWidth: 1.5,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  latestUpdatesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  latestUpdatesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  latestUpdatesSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  latestUpdatesIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
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
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 34,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  updatesContainer: {
    gap: spacing.md,
  },
  updateBorderWrapper: {
    borderRadius: borderRadius.xl,
    padding: 2.5,
    marginBottom: spacing.md,
    ...shadows.cloud,
    backgroundColor: colors.background, // Match screen background to hide square corner artifacts
  },
  updateCard: {
    backgroundColor: isDarkMode ? colors.card : colors.white,
    borderRadius: borderRadius.xl - 2.5,
    padding: spacing.lg,
    position: 'relative',
    borderWidth: isDarkMode ? 1.5 : 0,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
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
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  updateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.textLight,
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



