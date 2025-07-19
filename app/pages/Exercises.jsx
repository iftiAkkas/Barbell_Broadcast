import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Exercises() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.welcome, styles.neutralText]}>READY TO</Text>
          <Text style={[styles.welcome, styles.roseText]}>WORKOUT</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  textContainer: {
    marginBottom: 10,
  },
  welcome: {
    fontSize: hp('4.5%'),  // Responsive font size
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,       // tracking-wider
  },
  neutralText: {
    color: '#404040',       // tailwind: text-neutral-700
  },
  roseText: {
    color: '#be123c',       // tailwind: text-rose-700
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  avatar: {
    height: hp('6%'),
    width: hp('6%'),
    borderRadius: hp('3%'), // circular image
  },
});
