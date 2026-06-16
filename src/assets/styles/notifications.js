import { StyleSheet, Platform, Dimensions } from 'react-native';
import { typography, spacing, borderRadius, shadows } from './global';

const { width, height } = Dimensions.get('window');

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface, // Use surface for Soft UI
  },

  notificationsContainer: {
    paddingHorizontal: 20,
    paddingTop: 130, // Increased clearance for absolute floating header
    paddingBottom: spacing.xl,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface_container_lowest || colors.background, // Match surface for embossed look
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 20,
    ...shadows.cloud,
    // Soft UI Embossed Borders
    borderWidth: 1.5,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.95)',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',
  },
  unreadNotification: {
    // Enhanced unread state with subtle left glow/indicator
    borderLeftWidth: 6,
    borderLeftColor: colors.primary,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 10,
    alignSelf: 'center',
    ...shadows.cloud,
  },
});

export default createStyles;
