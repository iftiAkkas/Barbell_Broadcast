import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CommunityMessages from './CommunityMessages';
import PrivateMessages from './PrivateMessages';

const TopTab = createMaterialTopTabNavigator();

export default function SocialMessagesTabs() {
  return (
    <View style={styles.wrapper}>
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#3b82f6', // blue text for unselected
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
          tabBarStyle: {
            backgroundColor: 'white', // container background for tab bar
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'transparent', // we hide default indicator because we color the whole tab
          },
          tabBarPressColor: 'transparent',
          tabBarItemStyle: {
            borderRadius: 12,
            marginHorizontal: 5,
            marginVertical: 6,
          },
          tabBarScrollEnabled: false,
        }}
        sceneContainerStyle={{ backgroundColor: '#fff' }}
        tabBar={({ state, descriptors, navigation, position }) => {
          return (
            <View style={[styles.tabBarContainer]}>
              {state.routes.map((route, index) => {
                const focused = state.index === index;
                const { options } = descriptors[route.key];
                const label =
                  options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({
                    type: 'tabLongPress',
                    target: route.key,
                  });
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={focused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    testID={options.tabBarTestID}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={[
                      styles.tabItem,
                      focused ? styles.tabItemFocused : styles.tabItemUnfocused,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        focused ? styles.tabLabelFocused : styles.tabLabelUnfocused,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }}
      >
        <TopTab.Screen name="Community" component={CommunityMessages} />
        <TopTab.Screen name="Private" component={PrivateMessages} />
      </TopTab.Navigator>
    </View>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  tabItem: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  tabItemFocused: {
    backgroundColor: '#3b82f6', // blue background for selected
  },
  tabItemUnfocused: {
    backgroundColor: 'white', // white background for unselected
  },
  tabLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabLabelFocused: {
    color: 'white',
  },
  tabLabelUnfocused: {
    color: '#3b82f6',
  },
});
