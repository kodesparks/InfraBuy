import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, FlatList } from 'react-native';
import styles from '../../assets/styles/productListing';
import { colors } from '../../assets/styles/global';

const ProductListing = ({ navigation, route }) => {
  const { category } = route.params || { name: 'Products' };
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: 1,
      name: 'Ambuja Cement',
      originalPrice: '₹320.00',
      discountedPrice: '₹313.60',
      image: '🏗️',
      isFavorite: false
    },
    {
      id: 2,
      name: 'ACC Cement',
      originalPrice: '₹340.00',
      discountedPrice: '₹333.20',
      image: '🏗️',
      isFavorite: false
    },
    {
      id: 3,
      name: 'Ultra Tech',
      originalPrice: '₹330.00',
      discountedPrice: '₹323.40',
      image: '🏗️',
      isFavorite: false
    },
    {
      id: 4,
      name: 'MAHA Cement',
      originalPrice: '₹350.00',
      discountedPrice: '₹343.00',
      image: '🏗️',
      isFavorite: false
    }
  ];

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const toggleFavorite = (productId) => {
    // Handle favorite toggle logic
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        <Text style={styles.productImage}>{item.image}</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={styles.favoriteIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          <Text style={styles.discountedPrice}>{item.discountedPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleCartPress}>
            <Text style={styles.headerIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.darkGray}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ProductListing; 