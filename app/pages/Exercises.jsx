import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BodyParts from '../components/BodyParts';
import ImageSlider from '../components/ImageSlider';
import ProfileImage from '../components/profileImage';
import { sliderImages } from '../constants/index';
export default function Exercises() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.welcome, styles.neutralText]}>READY TO</Text>
          <Text style={[styles.welcome, styles.roseText]}>WORKOUT</Text>
        </View>
        <ProfileImage style={styles.profileImage} />
      </View>

      <View style={styles.sliderContainer}>
        <ImageSlider images={sliderImages}/>
      </View>

      <View style={styles.bodyPartsContainer}>
        <BodyParts />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: hp('4.5%'),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: hp('4%'),
    marginTop: 20,
  },
  textContainer: {
    justifyContent: 'center',
  },
  welcome: {
    fontSize: hp('4%'),
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: hp('5%'),
  },
  neutralText: {
    color: '#404040',
  },
  roseText: {
    color: '#be123c',
  },
  profileImage: {
    height: hp('50%'),  // bigger image
    width: hp('50%'),
    borderRadius: hp('10%'),
    marginRight: wp('10%'),
  },
  sliderContainer: {
    marginBottom: hp('3%'),
    paddingHorizontal: 16,
  },
  bodyPartsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
