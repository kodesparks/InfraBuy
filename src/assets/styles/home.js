import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from './global';

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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 20,
    ...shadows.cloud,
  },
  categoryImageContainer: {
    width: '100%',
    height: 120,
    marginBottom: 12,
  },
  categoryImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundDark || colors.lightGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImageText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },



});

