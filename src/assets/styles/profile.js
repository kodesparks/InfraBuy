import { StyleSheet, Platform, Dimensions } from 'react-native';
import { typography, spacing, borderRadius, shadows } from './global';

const { width } = Dimensions.get('window');

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 130, // Increased clearance for absolute floating header
    paddingBottom: 180, // Significant clearance for floating nav + FABs
  },

  // Profile Overview Card
  profileOverviewCard: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.cloud,
    borderWidth: isDarkMode ? 1.5 : 0,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // No border
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface_container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.cloud,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.on_surface,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 15,
    color: colors.on_surface_variant,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    ...shadows.cloud,
  },
  logoutIcon: {
    marginRight: spacing.sm,
  },
  logoutButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.cloud,
    borderWidth: 1.5,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.on_surface,
    letterSpacing: -0.3,
  },

  // Personal Information
  infoGrid: {
    gap: spacing.sm,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: isDarkMode ? colors.card : colors.background,
    ...shadows.cloud,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: isDarkMode ? colors.card : colors.background,
    ...shadows.cloud,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface_container,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.on_surface_variant,
    marginBottom: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: isDarkMode ? 0.8 : 1,
  },
  infoValue: {
    fontSize: 15,
    color: colors.on_surface,
    fontWeight: '700',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verificationText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Account Status
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusItem: {
    width: (width - spacing.md * 3 - spacing.sm) / 2 - 4,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface_container_low,
    borderRadius: borderRadius.lg,
  },
  statusLabel: {
    fontSize: 11,
    color: colors.on_surface_variant,
    marginTop: spacing.xs,
    marginBottom: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.on_surface,
  },

  // Permissions
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  permissionBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface_container,
    borderRadius: borderRadius.full,
  },
  permissionText: {
    fontSize: 12,
    color: colors.on_surface,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Account Details
  detailsGrid: {
    gap: spacing.sm,
  },
  detailItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface_container_low,
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.on_surface_variant,
    marginBottom: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    color: colors.on_surface,
    fontWeight: '600',
  },
  detailValueSmall: {
    fontSize: 13,
    color: colors.on_surface,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default createStyles;



