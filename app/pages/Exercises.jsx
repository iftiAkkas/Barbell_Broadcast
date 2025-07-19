// src/screens/Exercises.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Exercises() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Exercises Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  text: {
    fontSize: 20
  }
});
