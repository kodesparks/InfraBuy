import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, FlatList, Alert } from 'react-native';
import styles from '../../assets/styles/productListing';
import { colors } from '../../assets/styles/global';

const ProductListing = ({ navigation, route }) => {
  const { category } = route.params || { name: 'Products' };
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Ambuja Cement',
      originalPrice: '₹320.00',
      discountedPrice: '₹313.60',
      image: '🏗️',
      isFavorite: false,
      category: 'cement'
    },
    {
      id: 2,
      name: 'ACC Cement',
      originalPrice: '₹340.00',
      discountedPrice: '₹333.20',
      image: '🏗️',
      isFavorite: false,
      category: 'cement'
    },
    {
      id: 3,
      name: 'Ultra Tech',
      originalPrice: '₹330.00',
      discountedPrice: '₹323.40',
      image: '🏗️',
      isFavorite: false,
      category: 'cement'
    },
    {
      id: 4,
      name: 'MAHA Cement',
      originalPrice: '₹350.00',
      discountedPrice: '₹343.00',
      image: '🏗️',
      isFavorite: false,
      category: 'cement'
    },
    {
      id: 5,
      name: 'TATA TISCON 550SD',
      originalPrice: '₹8,500.00',
      discountedPrice: '₹8,330.00',
      image: '🏗️',
      isFavorite: false,
      category: 'iron'
    },
    {
      id: 6,
      name: 'JSW Steel Rods',
      originalPrice: '₹8,200.00',
      discountedPrice: '₹8,036.00',
      image: '🏗️',
      isFavorite: false,
      category: 'iron'
    }
  ]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'cement', label: 'Cement' },
    { id: 'iron', label: 'Iron' },
    { id: 'favorites', label: 'Favorites' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'favorites' ? product.isFavorite : product.category === selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const toggleFavorite = (productId) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
  };

  const handleFilterPress = (filterId) => {
    setSelectedFilter(filterId);
    setShowFilters(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
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
          <Text style={styles.favoriteIcon}>
            {item.isFavorite ? '❤️' : '🤍'}
          </Text>
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

  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        selectedFilter === item.id && styles.filterItemSelected
      ]}
      onPress={() => handleFilterPress(item.id)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === item.id && styles.filterTextSelected
      ]}>
        {item.label}
      </Text>
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
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.darkGray}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <FlatList
            data={filters}
            renderItem={renderFilterItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>
        {selectedFilter !== 'all' && (
          <TouchableOpacity onPress={() => handleFilterPress('all')}>
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ProductListing; 