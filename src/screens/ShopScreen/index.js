import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import createStyles from '../../assets/styles/shop';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const ShopScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const categories = [
    {
      id: 1,
      name: t('Cement'),
      image: '🏗️',
      description: t('High quality cement for construction'),
      productCount: 12
    },
    {
      id: 2,
      name: t('Iron'),
      image: '🏗️',
      description: t('Steel reinforcement bars'),
      productCount: 8
    },
    {
      id: 3,
      name: t('Concrete Mixer'),
      image: '🏗️',
      description: t('Concrete mixing equipment'),
      productCount: 5
    },
    {
      id: 4,
      name: t('Bricks'),
      image: '🧱',
      description: t('Quality bricks for construction'),
      productCount: 15
    },
    {
      id: 5,
      name: t('Sand'),
      image: '🏖️',
      description: t('Fine sand for construction'),
      productCount: 10
    },
    {
      id: 6,
      name: t('Aggregate'),
      image: '🪨',
      description: t('Construction aggregates'),
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
        <Text style={styles.productCount}>{item.productCount}{t(' products')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.shopTitle}>{t('Shop')}</Text>
        <Text style={styles.shopSubtitle}>{t('Browse all construction materials')}</Text>

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

