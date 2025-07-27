import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import BodyParts from '../components/BodyParts';
import ImageSlider from '../components/ImageSlider';

export default function Exercises() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.welcome, styles.neutralText]}>READY TO</Text>
          <Text style={[styles.welcome, styles.roseText]}>WORKOUT</Text>
        </View>
        <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
      </View>

      {/* image slider */}
      <View style={styles.sliderContainer}>
        <ImageSlider />
      </View>

      {/* body parts */}
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
    paddingTop: hp('3%'), // More top padding
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: hp('2.5%'),
  },
  textContainer: {
    justifyContent: 'center',
  },
  welcome: {
    fontSize: hp('4.3%'),
    fontWeight: '700',
    letterSpacing: 1,
  },
  neutralText: {
    color: '#404040',
  },
  roseText: {
    color: '#be123c',
  },
  avatar: {
    height: hp('6.5%'),
    width: hp('6.5%'),
    borderRadius: hp('3.25%'),
    backgroundColor: '#f3f3f3',
  },
  sliderContainer: {
    marginBottom: hp('2%'),
    paddingHorizontal: 16,
  },
  bodyPartsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
