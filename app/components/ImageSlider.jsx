import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    View
} from 'react-native';
import { sliderImages } from '../constants/index';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const SPACER_WIDTH = (width - ITEM_WIDTH) / 2;
const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

export default function ImageSlider() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Add spacers to center first & last image
  const dataWithSpacers = [
    { key: 'left-spacer' },
    ...sliderImages.map((img, index) => ({ key: `img-${index}`, image: img })),
    { key: 'right-spacer' },
  ];

  const [currentIndex, setCurrentIndex] = useState(1); // start at first real image

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= dataWithSpacers.length - 1) {
        // When reaching the right spacer, smoothly scroll back to first image
        flatListRef.current?.scrollToIndex({ index: 1, animated: true });
        setCurrentIndex(1);
      } else {
        // Scroll to next item
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [currentIndex, dataWithSpacers.length]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / ITEM_WIDTH);
        if (index >= 1 && index <= sliderImages.length) {
          setCurrentIndex(index);
        }
      },
    }
  );

  return (
    <Animated.FlatList
      ref={flatListRef}
      data={dataWithSpacers}
      keyExtractor={(item) => item.key}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_WIDTH}
      decelerationRate="fast"
      bounces={false}
      contentContainerStyle={{ alignItems: 'center' }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      initialScrollIndex={1} // Start at first real image
      getItemLayout={(data, index) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
      })}
      renderItem={({ item, index }) => {
        if (!item.image) {
          return <View style={{ width: SPACER_WIDTH }} />;
        }

        const inputRange = [
          (index - 2) * ITEM_WIDTH,
          (index - 1) * ITEM_WIDTH,
          index * ITEM_WIDTH,
        ];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.9, 1, 0.9],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View style={[styles.itemContainer, { transform: [{ scale }] }]}>
            <Image source={item.image} style={styles.image} />
          </Animated.View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    width: ITEM_WIDTH,
    height: 200,
    borderRadius: 20,
    marginHorizontal: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});