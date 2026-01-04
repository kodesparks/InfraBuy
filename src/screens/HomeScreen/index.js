import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import PincodeModal from '../../components/common/PincodeModal';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';

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
  
  const categories = [
    {
      id: 1,
      name: 'Cement',
      description: 'Premium quality cement from top brands',
      image: require('../../assets/images/home_cement.jpeg'),
      icon: 'layers',
      color: '#3B82F6',
    },
    {
      id: 2,
      name: 'Steel',
      description: 'High-grade steel for strong construction',
      image: require('../../assets/images/steel_home.jpeg'),
      icon: 'box',
      color: '#10B981',
    },
    {
      id: 3,
      name: 'Concrete Mix',
      description: 'Ready-to-use concrete solutions',
      image: require('../../assets/images/mixer-truck.jpg'),
      icon: 'truck',
      color: '#F59E0B',
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
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={category.image}
        style={styles.categoryBackground}
        imageStyle={styles.categoryBackgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.categoryOverlay}
        >
          <View style={styles.categoryIconContainer}>
            <View style={[styles.categoryIconCircle, { backgroundColor: category.color }]}>
              <Icon name={category.icon} size={28} color="white" />
            </View>
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <View style={styles.categoryButtonContainer}>
              <Text style={styles.categoryButtonText}>Explore</Text>
              <Icon name="arrow-right" size={16} color="white" />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner Section */}
        <LinearGradient
          colors={['#723FED', '#3B58EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Welcome to infraXpert</Text>
              <Text style={styles.heroSubtitle}>
                Your trusted partner for premium building materials
              </Text>
            </View>
            <View style={styles.heroIconContainer}>
              <Icon name="home" size={40} color="white" />
            </View>
          </View>
        </LinearGradient>

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
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductListing')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
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
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>Quick and reliable delivery to your site</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon name="shield" size={24} color="#3B82F6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Quality Assured</Text>
              <Text style={styles.featureDescription}>Premium materials from trusted brands</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon name="dollar-sign" size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Best Prices</Text>
              <Text style={styles.featureDescription}>Competitive pricing for all products</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  // Hero Banner
  heroBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  heroIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Quick Actions
  quickActionsSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  quickActionCard: {
    width: (width - spacing.md * 3) / 2,
    height: 100,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionGradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
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
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  categoriesContainer: {
    gap: spacing.md,
  },
  categoryCard: {
    height: 220,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryBackground: {
    flex: 1,
    width: '100%',
  },
  categoryBackgroundImage: {
    borderRadius: borderRadius.xl,
  },
  categoryOverlay: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  categoryIconContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryName: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  categoryDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Features
  featuresSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
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