import { StyleSheet, Dimensions } from 'react-native';
import { colors, typography } from './global';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    width: width * 0.85,
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  orderSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: colors.darkGray,
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