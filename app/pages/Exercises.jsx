import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import BodyParts from '../components/BodyParts';
import ImageSlider from '../components/ImageSlider';
import ProfileImage from '../components/profileImage';
import { sliderImages } from '../constants/index';

export default function Exercises() {
  const DATA = [1]; // dummy for BodyParts

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <View style={styles.readyToContainer}>
            <Text style={styles.readyToText}>READY TO</Text>
          </View>
          <View style={styles.workoutContainer}>
            <Text style={styles.workoutText}>WORKOUT</Text>
          </View>
        </View>
        <ProfileImage />
      </View>

      {/* Scrollable Content */}
      <FlatList
        data={DATA}
        keyExtractor={(item, index) => index.toString()}
        renderItem={() => <BodyParts />}
        ListHeaderComponent={
          <View style={styles.sliderContainer}>
            <ImageSlider images={sliderImages} />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: hp('0%'),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp('5%'),
    marginBottom: hp('0.5%'),
    height: hp('20%'),
  },
  textContainer: {
    justifyContent: 'center',
  },
  readyToContainer: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    marginBottom: hp('0.5%'),
    marginTop: hp('4%'),
  },
  readyToText: {
    fontSize: hp('3.5%'),
    fontWeight: '700',
    color: '#ffffff',
  },
  workoutContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  workoutText: {
    fontSize: hp('3.5%'),
    fontWeight: '700',
    color: '#3b82f6',
  },
  sliderContainer: {
    paddingHorizontal: wp('4%'),
    marginBottom: hp('3%'),
  },
});
