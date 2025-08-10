import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import styles from '../../assets/styles/shop';

const ShopScreen = ({ navigation }) => {
  const categories = [
    {
      id: 1,
      name: 'Cement',
      image: '🏗️',
      description: 'High quality cement for construction',
      productCount: 12
    },
    {
      id: 2,
      name: 'Iron',
      image: '🏗️',
      description: 'Steel reinforcement bars',
      productCount: 8
    },
    {
      id: 3,
      name: 'Concrete Mixer',
      image: '🏗️',
      description: 'Concrete mixing equipment',
      productCount: 5
    },
    {
      id: 4,
      name: 'Bricks',
      image: '🧱',
      description: 'Quality bricks for construction',
      productCount: 15
    },
    {
      id: 5,
      name: 'Sand',
      image: '🏖️',
      description: 'Fine sand for construction',
      productCount: 10
    },
    {
      id: 6,
      name: 'Aggregate',
      image: '🪨',
      description: 'Construction aggregates',
      productCount: 7
    }
  ];

  const handleCategoryPress = (category) => {
    navigation.navigate('ProductListing', { category });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryImageContainer}>
        <Text style={styles.categoryImage}>{item.image}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <Text style={styles.productCount}>{item.productCount} products</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.shopTitle}>Shop</Text>
        <Text style={styles.shopSubtitle}>Browse all construction materials</Text>
        
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>
    </View>
  );
};

export default ShopScreen; 