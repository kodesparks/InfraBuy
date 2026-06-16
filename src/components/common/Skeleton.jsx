import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const Skeleton = ({ width, height, borderRadius, style }) => {
  const { colors, isDarkMode } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const shimmerWidth = typeof width === 'number' ? width : screenWidth;

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-shimmerWidth, shimmerWidth],
  });

  return (
    <View
      style={[
        styles.base,
        {
          width: width || '100%',
          height: height || 20,
          borderRadius: borderRadius || 4,
          backgroundColor: isDarkMode ? '#1F2937' : '#E5E7EB',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={
            isDarkMode
              ? ['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']
              : ['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    position: 'relative',
  },
});

export default Skeleton;
