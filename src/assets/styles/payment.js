import { StyleSheet, Platform, Dimensions } from 'react-native';
import { typography, spacing, borderRadius, shadows } from './global';

const { width } = Dimensions.get('window');

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150, // Clearance for absolute floating button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.cloud,
    borderWidth: isDarkMode ? 1.5 : 0,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  paymentMethodsGrid: {
    gap: spacing.md,
  },
  paymentMethodCard: {
    width: '100%',
    backgroundColor: isDarkMode ? colors.cardLight : colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    flexDirection: 'row', // Horizontal layout like Home screen categories
    gap: spacing.md,
    minHeight: 100,
    justifyContent: 'flex-start',
    ...shadows.cloud,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
  },
  paymentMethodCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    // Remove shadow for selected state as requested
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentMethodIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodIconSelected: {
    backgroundColor: colors.primary,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  paymentMethodNameSelected: {
    color: colors.primary,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  form: {
    marginTop: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: isDarkMode ? colors.cardLight : colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  upiOptions: {
    marginBottom: spacing.md,
  },
  upiAppsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  upiAppCard: {
    width: (width - spacing.md * 4 - spacing.sm * 3) / 4,
    backgroundColor: isDarkMode ? colors.cardLight : colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    ...shadows.cloud,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
  },
  upiAppCardSelected: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(103, 49, 226, 0.1)' : colors.primary + '10',
  },
  upiAppIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  upiAppName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: isDarkMode ? '#60A5FA' : colors.info,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: isDarkMode ? '#FBBF24' : colors.warning,
    lineHeight: 20,
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#D1FAE5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  successBoxText: {
    flex: 1,
    fontSize: 13,
    color: isDarkMode ? '#34D399' : colors.success,
    lineHeight: 20,
  },
  deliveryItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  deliveryItemValue: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  orderTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  payButton: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    width: width * 0.7, // Pill size
    borderRadius: borderRadius.full,
    ...shadows.cloud,
    overflow: 'hidden',
    zIndex: 100,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successContent: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.cloud,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: spacing.lg,
    borderWidth: isDarkMode ? 1.5 : 0,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonCancelText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    backgroundColor: 'transparent',
  },
  modalButtonConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default createStyles;
