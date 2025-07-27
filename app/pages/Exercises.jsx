import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
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
    paddingTop: hp('4.5%'), // more top padding for better spacing from status bar
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: hp('4%'), 
    marginTop:20 // increased bottom margin for better spacing below header
  },
  textContainer: {
    justifyContent: 'center',
  },
  welcome: {
    fontSize: hp('4%'),  // slightly smaller for balance
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: hp('5%'), // add line height for vertical spacing between lines
  },
  neutralText: {
    color: '#404040',
  },
  roseText: {
    color: '#be123c',
  },
  avatar: {
    height: hp('7%'),      // slightly bigger avatar for better presence
    width: hp('7%'),
    borderRadius: hp('3.5%'),
    backgroundColor: '#f3f3f3',
    marginLeft: wp('3%'),  // add margin between text and avatar
  },
  sliderContainer: {
    marginBottom: hp('3%'),  // add more space after slider
    paddingHorizontal: 16,
  },
  bodyPartsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
