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
        renderItem={({ item }) => <BodyPartCard router={router} item={item} />}
      />
    </View>
  );
}

const BodyPartCard = ({ item, router }) => {
  return (
    <TouchableOpacity style={styles.cardButton} onPress={() => router.push({pathname: '/pages/BodyPartDetailsScreen', params: item})}>
      <Image
        source={item.image}
        resizeMode="cover"
        style={styles.cardImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.gradientOverlay}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text style={styles.cardText}>{item?.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginHorizontal: wp('1%'),
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: wp('44%'),
    height: hp('15%'),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  cardText: {
    position: 'absolute',
    bottom: hp('2%'),
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    fontSize: hp('2.3%'),
  },
});
