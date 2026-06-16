import { StyleSheet, Dimensions } from 'react-native';
import { typography, spacing, borderRadius, shadows } from './global';

const { width, height } = Dimensions.get('window');

const createStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: 30,
    width: width * 0.85,
    maxWidth: 350,
    alignItems: 'center',
    ...shadows.cloud,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  orderSummary: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 25,
    width: '100%',
    ...shadows.cloud,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  continueButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    gap: 8,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default createStyles;
