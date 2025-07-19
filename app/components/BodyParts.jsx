import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { bodyParts } from '../constants/index';

export default function BodyParts() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercises</Text>

      <FlatList
        data={bodyParts}
        numColumns={2}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => <BodyPartCard item={item} />}
      />
    </View>
  );
}

const BodyPartCard = ({ item }) => {
  return (
    <TouchableOpacity style={styles.cardButton}>
      <Image
        source={item.image}
        resizeMode="cover"
        style={styles.cardImage}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // optional
  },
  title: {
    fontSize: hp('3.5%'),
    fontWeight: 'bold',
    color: '#404040',
    marginBottom: hp('2%'),
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  listContent: {
    paddingHorizontal: wp('2.5%'),
    paddingBottom: hp('5%'),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  cardButton: {
    width: wp('44%'),
    height: hp('30%'),
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginHorizontal: wp('1%'),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});
