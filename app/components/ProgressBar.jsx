import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ progress }) {
  return (
    <View style={styles.barBackground}>
      <View style={[styles.barFill, { flex: progress }]} />
      <View style={[styles.barEmpty, { flex: 1 - progress }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  barBackground: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#b2dfdb',
  },
  barFill: {
    backgroundColor: '#00796b',
  },
  barEmpty: {
    backgroundColor: '#e0f2f1',
  },
});
