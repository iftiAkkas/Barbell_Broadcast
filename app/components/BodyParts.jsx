import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

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
        renderItem={({ item }) => (
          <BodyPartCard router={router} item={item} />
        )}
      />
    </View>
  );
}

const BodyPartCard = ({ item, router }) => {
  return (
    <TouchableOpacity
      style={styles.cardButton}
      onPress={() =>
        router.push({
          pathname: '/pages/BodyPartDetailsScreen',
          params: { name: item.name },
        })
      }
    >
      <Image source={item.image} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradientOverlay}
      />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff', // subtle light background
  },
  title: {
    fontSize: hp('3%'),
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
    marginBottom: hp('2%'),
  },
  listContent: {
    paddingHorizontal: wp('3%'),
    paddingBottom: hp('5%'),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  cardButton: {
    width: wp('42%'),
    height: hp('24%'),
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    height: '40%',
    width: '100%',
  },
  cardText: {
    position: 'absolute',
    bottom: hp('1.8%'),
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: hp('2.1%'),
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
