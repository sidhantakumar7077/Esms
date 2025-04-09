import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const SkeletonLoader = ({ width = screenWidth - 40, height = 100, borderRadius = 10 }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false, // Set to false since we are animating styles
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, []);

  const animatedStyle = {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
  };

  return (
    <View style={[styles.container, { width, height, borderRadius }]}> 
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
};

const SkeletonList = () => {
  const renderItem = () => <SkeletonLoader />;

  return (
    <FlatList
      data={Array(7).fill(null)}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E1E1E1',
    overflow: 'hidden',
    marginVertical: 10,
    alignSelf: 'center',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F2F2F2',
  },
  listContainer: {
    padding: 10,
  }
});

export default SkeletonList;