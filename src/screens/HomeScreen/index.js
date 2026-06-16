import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { spacing, borderRadius, shadows } from '../../assets/styles/global';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import PincodeModal from '../../components/common/PincodeModal';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';
import Skeleton from '../../components/common/Skeleton';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const {
    cartCount,
    notificationCount,
    addToCart,
    showPincodeModal,
    setShowPincodeModal,
    handlePincodeSet,
  } = useAppContext();

  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const categories = [
    {
      id: 1,
      name: 'Cement',
      description: 'Premium quality cement from top brands',
      icon: 'package',
      image: require('../../assets/images/cement_tab.png'),
      color: '#F59E0B',
      gradientColors: ['#FF9D2E', '#3B82F6', '#723FED'], // Shared multi-color gradient (Orange, Blue, Violet)
    },
    {
      id: 2,
      name: 'Steel',
      description: 'High-grade steel for strong construction',
      icon: 'activity',
      image: require('../../assets/images/steel_tab.png'),
      color: '#723FED',
      gradientColors: ['#FF9D2E', '#3B82F6', '#723FED'], // Shared multi-color gradient (Orange, Blue, Violet)
    },
    {
      id: 3,
      name: 'Others',
      description: 'Specialized materials and site accessories',
      icon: 'grid',
      image: require('../../assets/images/others_png.png'),
      color: '#3B82F6',
      gradientColors: ['#FF9D2E', '#3B82F6', '#723FED'], // Shared multi-color gradient (Orange, Blue, Violet)
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Track Order',
      icon: 'map-pin',
      color: '#723FED',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      id: 2,
      title: 'My Orders',
      icon: 'package',
      color: '#3B82F6',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      id: 3,
      title: 'Support',
      icon: 'headphones',
      color: '#10B981',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 4,
      title: 'Updates',
      icon: 'bell',
      color: '#F59E0B',
      onPress: () => navigation.navigate('MainApp', { screen: 'Updates' }),
    },
  ];

  const handleCategoryPress = (category) => {
    // Navigate to ProductListing without adding to cart
    navigation.navigate('ProductListing', { category });
  };

  const renderCategoryCard = (category) => (
    <View key={category.id} style={styles.categoryShadowWrapper}>
      <LinearGradient
        colors={category.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }} // Horizontal mix for better color blending
        style={styles.categoryBorderGradient}
      >
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.9}
        >
          <View style={styles.categoryCardInner}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{t(category.name)}</Text>
              <Text style={styles.categoryDescription}>{t(category.description)}</Text>
              <View style={styles.exploreButton}>
                <Text style={styles.exploreText}>{t('Explore')}</Text>
                <Icon name="arrow-right" size={14} color={colors.textPrimary} />
              </View>
            </View>
            {category.image && (
              <Image
                source={category.image}
                style={[
                  styles.categoryRightImage,
                  category.name === 'Steel'
                    ? { right: 5, bottom: -15, width: 210, height: 210 }
                    : category.name === 'Others'
                      ? { right: 12, bottom: 15, width: 135, height: 135 }
                      : { right: -40, bottom: -30, width: 240, height: 240 }
                ]}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[action.color, action.color + 'DD']}
        style={styles.quickActionGradient}
      >
        <Icon name={action.icon} size={24} color="white" />
        <Text style={styles.quickActionText}>{action.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderHomeSkeleton = () => (
    <View style={styles.scrollContent}>
      {/* Search/Pincode bar skeleton */}
      <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.xl }}>
        <Skeleton width="100%" height={50} borderRadius={25} />
      </View>

      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Skeleton width={150} height={24} borderRadius={4} />
        </View>
        {[1, 2].map(i => (
          <View key={i} style={[styles.categoryShadowWrapper, { height: 190 }]}>
            <View style={[styles.categoryCardInner, { padding: 20 }]}>
              <View style={{ flex: 1, paddingRight: 80 }}>
                <Skeleton width="60%" height={28} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="90%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: 20 }} />
                <Skeleton width={100} height={32} borderRadius={16} />
              </View>
              <Skeleton width={140} height={140} borderRadius={12} style={{ position: 'absolute', right: 0 }} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.featuresSection}>
        {[1, 2].map(i => (
          <View key={i} style={styles.featureCard}>
            <Skeleton width={52} height={52} borderRadius={26} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Skeleton width="40%" height={18} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="80%" height={14} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    // Simulate initial loading to show skeleton
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.content}>
          {renderHomeSkeleton()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >


        {/* Quick Actions Section */}
        {/* <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View> */}

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Browse Categories')}</Text>
          </View>
          <View style={styles.categoriesContainer}>
            {categories.map(renderCategoryCard)}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon name="truck" size={24} color="#10B981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('Fast Delivery')}</Text>
              <Text style={styles.featureDescription}>{t('Quick and reliable delivery to your site')}</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon name="shield" size={24} color="#3B82F6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('Quality Assured')}</Text>
              <Text style={styles.featureDescription}>{t('Premium materials from trusted brands')}</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon name="dollar-sign" size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('Best Prices')}</Text>
              <Text style={styles.featureDescription}>{t('Competitive pricing for all products')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Initial Pincode Modal - Only shows when no pincode is saved */}
      <PincodeModal
        visible={showPincodeModal}
        onClose={() => setShowPincodeModal(false)}
        onPincodeSet={handlePincodeSet}
      />

      <CustomerCareFooter />
    </View>
  );
};

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 95, // Clearance for absolute header (56px + status bar)
    paddingBottom: 120, // Final clearance for Bottom Nav
  },
 
  // Categories
  categoriesSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary, // Dynamic color based on theme
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  categoryShadowWrapper: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background, // Essential for shadow shape on some platforms
    marginBottom: spacing.md,
    ...shadows.cloud,
    overflow: 'visible', // Ensure shadow and floating assets are visible
  },
  categoryBorderGradient: {
    padding: 2.5,
    borderRadius: borderRadius.xl,
    overflow: 'visible',
  },
  categoryCard: {
    height: 190,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    overflow: 'visible', // CRITICAL: Allow PNGs to pop out
  },
  categoryCardInner: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.xl - 2.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    position: 'relative',
    borderWidth: isDarkMode ? 1.5 : 0,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
    overflow: 'visible', 
    zIndex: 1,
  },
  categoryInfo: {
    flex: 1,
    paddingLeft: spacing.md, // Indent text for the 'Fast Delivery' feel
    paddingRight: 100, // Space for the large PNG assets
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 6,
    alignSelf: 'flex-start',
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  categoryRightImage: {
    position: 'absolute',
    height: 200, // Large popping PNGs
    zIndex: 10, // Ensure it floats above the glass
  },
  // Features
  featuresSection: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? colors.card : colors.background, 
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.cloud,
    borderWidth: 1.2,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderBottomColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    borderRightColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default HomeScreen;

