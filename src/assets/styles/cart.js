import { StyleSheet, Platform, Dimensions } from 'react-native';
import { typography, spacing, borderRadius, shadows } from './global';

const { width, height } = Dimensions.get('window');

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface, // Base surface
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 130, // Increased clearance for absolute floating header
    paddingBottom: 150,
  },
  cartCard: {
    backgroundColor: colors.background, // Match Soft UI Base
    borderRadius: borderRadius.xl, // 32px
    padding: spacing.lg,
    ...shadows.cloud,
    // No-Line Rule: No borders or legacy shadows
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    // No-Line Rule: Border removed
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.on_surface,
    letterSpacing: -0.5,
  },
  clearCartButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clearCartText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCartContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 18,
    color: colors.on_surface_variant,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  continueShoppingButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.cloud,
  },
  continueShoppingButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  continueShoppingText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: isDarkMode ? colors.card : colors.background,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.cloud,
    borderWidth: isDarkMode ? 1.5 : 0,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface_container_lowest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.on_surface,
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 12,
    color: colors.on_surface_variant,
    fontWeight: '500',
  },
  itemBrand: {
    fontSize: 13,
    color: colors.on_surface_variant,
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemCategory: {
    fontSize: 12,
    color: colors.on_surface_variant,
    marginTop: 2,
    opacity: 0.8,
  },
  itemActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface_container_lowest,
    borderRadius: borderRadius.full,
    padding: 2,
    flexShrink: 0,
    height: 44,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface_container_low,
    justifyContent: 'center',
    alignItems: 'center',
    // No borders or shadows here for clean track look
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.on_surface,
    minWidth: 40,
    textAlign: 'center',
    paddingVertical: 0,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    // Add a soft lift for destructive floating action
    ...shadows.cloud,
  },
  deliveryDetailsContainer: {
    marginTop: spacing.xl,
    // The margin and padding is handled by gradientBorderWrapper and sectionInner
  },
  gradientBorderWrapper: {
    borderRadius: borderRadius.xl,
    padding: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionInner: {
    backgroundColor: isDarkMode ? colors.card : colors.background,
    borderRadius: borderRadius.xl - 2,
    padding: spacing.lg,
    ...shadows.cloud,
    borderWidth: 1.5,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  itemBorderWrapper: {
    borderRadius: borderRadius.lg,
    padding: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  itemInner: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg - 2,
    padding: spacing.md,
    ...shadows.cloud,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.on_surface,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.on_surface_variant,
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.sm,
  },
  textInput: {
    borderRadius: borderRadius.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.on_surface,
    backgroundColor: colors.surface_container_low,
    // No borders
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    color: colors.on_surface,
    fontWeight: '500',
  },
  placeholderText: {
    color: colors.on_surface_variant,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  dropdownModalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: height * 0.6,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  dropdownModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.on_surface,
    letterSpacing: -0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  dropdownItemActive: {
    backgroundColor: colors.surface_container_low,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.on_surface,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  floatingEnquiryButton: {
    width: width - 40,
    height: 64,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    // Apply the "Cloud Shadow" for premium floating effect
    ...shadows.cloud,
  },
  placeOrderButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: spacing.sm,
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default createStyles;
