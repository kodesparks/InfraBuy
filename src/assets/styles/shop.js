import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, typography } from './global';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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