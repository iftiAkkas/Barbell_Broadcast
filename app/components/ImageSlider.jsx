import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const SPACER_WIDTH = (width - ITEM_WIDTH) / 2;
const AUTO_SCROLL_INTERVAL = 4000;

export default function ImageSlider({ images }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);

  const dataWithSpacers = [
    { key: 'left-spacer' },
    ...images.map((item, index) => ({
      key: `img-${index}`,
      image: item.image,
      label: item.label || '',
    })),
    { key: 'right-spacer' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + 1;
        if (nextIndex >= dataWithSpacers.length - 1) {
          nextIndex = 1;
        }
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / ITEM_WIDTH);
        if (index >= 1 && index <= images.length) {
          setCurrentIndex(index);
        }
      },
    }
  );

  return (
    <Animated.FlatList
      ref={flatListRef}
      data={dataWithSpacers}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_WIDTH}
      decelerationRate="fast"
      bounces={false}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{ alignItems: 'center' }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      initialScrollIndex={1}
      getItemLayout={(_, index) => ({
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
          outputRange: [0.92, 1, 0.92],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.5, 1, 0.5],
          extrapolate: 'clamp',
        });

        const imageStyle = item.label ? styles.imageWithLabel : styles.imageFull;
        const itemStyle = item.label ? styles.itemContainer : { ...styles.itemContainer, height: 220 };
        return (
          <Animated.View
            style={[
              itemStyle,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <Image source={item.image} style={imageStyle} resizeMode="cover" />
            {item.label ? (
              <Text style={styles.labelText}>{item.label}</Text>
            ) : null}
          </Animated.View>
        );
      }}
    />
  );
}

ImageSlider.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.oneOfType([
        PropTypes.number, // require(...)
        PropTypes.shape({ uri: PropTypes.string }),
      ]).isRequired,
      label: PropTypes.string,
    })
  ).isRequired,
};

const styles = StyleSheet.create({
  itemContainer: {
    width: ITEM_WIDTH,
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 10,
    backgroundColor: '#3b82f6',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: 'center',
  },
  imageWithLabel: {
    width: '100%',
    height: 280,
    borderRadius: 16,
  },
  imageFull: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  labelText: {
    paddingTop: 16,
    paddingBottom: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});
