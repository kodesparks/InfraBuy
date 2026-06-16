import { StyleSheet, Platform, Dimensions } from 'react-native';
import { typography } from './global';

const { width, height } = Dimensions.get('window');

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100, // Standard clearance for absolute floating header
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  shopSubtitle: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.borderLight || '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: colors.backgroundDark || colors.lightGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryImage: {
    fontSize: 40,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.darkGray,
    lineHeight: 16,
    marginBottom: 5,
  },
  productCount: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default createStyles;
