import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import styles from '../../assets/styles/home';

const HomeScreen = ({ navigation }) => {
  const categories = [
    {
      id: 1,
      name: 'Cement',
      image: require('../../assets/images/cement.png'),
      description: 'High quality cement for construction'
    },
    {
      id: 2,
      name: 'Iron',
      image: require('../../assets/images/iron.png'),
      description: 'Steel reinforcement bars'
    },
    {
      id: 3,
      name: 'Concrete Mixer',
      image: require('../../assets/images/concrete-mixer.png'),
      description: 'Concrete mixing equipment'
    }
  ];

  const handleCategoryPress = (category) => {
    navigation.navigate('ProductListing', { category });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Chat')}>
            <Text style={styles.headerIconText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleCartPress}>
            <Text style={styles.headerIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryImageContainer}>
                <View style={styles.categoryImagePlaceholder}>
                  <Text style={styles.categoryImageText}>{category.name}</Text>
                </View>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

export default HomeScreen; 