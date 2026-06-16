import { StyleSheet, Platform, Dimensions } from 'react-native';
import { typography, spacing, borderRadius, shadows } from './global';

const { width, height } = Dimensions.get('window');

const createStyles = (colors, isDarkMode) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface, // Use spec base color
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface, 
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface_container_low, // Tonal contrast
    borderRadius: borderRadius.full, // 2rem / pill specification
    paddingHorizontal: 15,
    paddingVertical: 12,
    // THE SPEC: Ambient Shadow for floating elements
    ...shadows.cloud,
  },
  searchIcon: {
    fontSize: 18,
    color: colors.on_surface_variant,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.on_surface,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface_container_high,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  clearButtonText: {
    fontSize: 12,
    color: colors.on_surface_variant,
    fontWeight: '700',
  },
  filterButton: {
    marginLeft: 10,
  },
  filterIcon: {
    fontSize: 18,
    color: colors.on_surface_variant,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: colors.surface,
  },
  filterList: {
    paddingRight: 20,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: borderRadius.full, // Pill-shaped as per SPEC
    backgroundColor: colors.surface_container_low,
    // The "No-Line" rule: Borders/dividers are prohibited.
  },
  filterItemSelected: {
    backgroundColor: 'transparent',
    // Selection handled by LinearGradient in component
  },
  filterText: {
    fontSize: 14,
    color: colors.on_surface_variant,
    fontWeight: '500',
  },
  filterTextSelected: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: colors.on_surface_variant,
  },
  clearFilterText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.on_surface,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.on_surface_variant,
    textAlign: 'center',
    lineHeight: 21,
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productsGrid: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'stretch',
  },
  productShadowWrapper: {
    padding: 8, 
    width: (width - 24) / 3, 
  },
  productCard: {
    width: '100%',
    backgroundColor: isDarkMode ? '#111318' : '#FFFFFF',
    borderRadius: 14, // Increased safety margin to prevent clipping
    overflow: 'hidden',
    borderWidth: 0,
    minHeight: 200, // Ensure consistent card height
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1, 
    backgroundColor: isDarkMode ? '#1A1D21' : '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  placeholderImage: {
    padding: 16,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  productInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between', // Push button to bottom
  },
  productName: {
    fontSize: 12, 
    fontWeight: '700',
    color: isDarkMode ? '#E5E7EB' : '#1F2937',
    marginBottom: 4,
    lineHeight: 16,
    minHeight: 32, 
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: isDarkMode ? '#9CA3AF' : '#4B5563',
    marginBottom: 10,
  },
  enquiryButton: {
    width: '100%',
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  enquiryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});


export default createStyles;


