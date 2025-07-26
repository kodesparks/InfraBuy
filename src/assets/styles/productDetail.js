import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, typography } from './global';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#4A5568',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
  },
  headerIconText: {
    fontSize: 20,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  productImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    fontSize: 80,
  },
  productInfoCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -20,
    minHeight: height * 0.6,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 20,
  },
  quantityContainer: {
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  selectedQuantity: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
  addToOrderButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  addToOrderText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  expandableSections: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 20,
  },
  expandableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  expandableText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  expandableArrow: {
    fontSize: 16,
    color: colors.darkGray,
  },
  expandableArrowRotated: {
    transform: [{ rotate: '90deg' }],
  },
  expandableContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.lightGray,
    marginHorizontal: -10,
    marginBottom: 10,
    borderRadius: 8,
  },
  expandableContentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  specLabel: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  deliveryIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  deliverySubtitle: {
    fontSize: 12,
    color: colors.darkGray,
  },
}); 