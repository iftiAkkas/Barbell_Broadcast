// SocialTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SocialHome from './SocialHome';
import SocialMessages from './SocialMessages';

const Tab = createBottomTabNavigator();

export default function SocialTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = 'chatbubble-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={SocialHome} />
      <Tab.Screen name="Messages" component={SocialMessages} />
    </Tab.Navigator>
  );
}
