import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { useAppContext } from '../../context/AppContext';
import PincodeModal from '../../components/common/PincodeModal';

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
    },
    {
      id: 2,
      name: 'Steel',
      description: 'High-grade steel for strong construction',
      image: require('../../assets/images/steel_home.jpeg'),
    },
    {
      id: 3,
      name: 'Concrete Mix',
      description: 'Ready-to-use concrete solutions',
      image: require('../../assets/images/mixer-truck.jpg'),
    }
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
    >
      <ImageBackground
        source={category.image}
        style={styles.categoryBackground}
        imageStyle={styles.categoryBackgroundImage}
      >
        <View style={styles.categoryOverlay}>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
          <TouchableOpacity style={styles.categoryButton}>
            <Icon name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Find the best building materials for your projects
          </Text>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Product Categories</Text>
          <View style={styles.categoriesContainer}>
            {categories.map(renderCategoryCard)}
          </View>
        </View>
      </ScrollView>

      {/* Initial Pincode Modal - Only shows when no pincode is saved */}
      <PincodeModal
        visible={showPincodeModal}
        onClose={() => setShowPincodeModal(false)}
        onPincodeSet={handlePincodeSet}
      />
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
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  welcomeSection: {
    paddingVertical: spacing.lg,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  categoriesSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    gap: spacing.md,
  },
  categoryCard: {
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryBackground: {
    flex: 1,
    width: '100%',
  },
  categoryBackgroundImage: {
    borderRadius: borderRadius.lg,
  },
  categoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryDescription: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default HomeScreen; 