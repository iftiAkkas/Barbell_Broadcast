import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CommunityMessages from './CommunityMessages';
import PrivateMessages from './PrivateMessages';

const TopTab = createMaterialTopTabNavigator();

export default function SocialMessagesTabs() {
  return (
    <View style={styles.wrapper}>
      <TopTab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 14 },
          tabBarStyle: {
            backgroundColor: '#f8f8f8',
          },
        }}
      >
        <TopTab.Screen name="Community" component={CommunityMessages} />
        <TopTab.Screen name="Private" component={PrivateMessages} />
      </TopTab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 40, // Adjust this value as needed for spacing from top
    backgroundColor: '#fff',
  },
});
