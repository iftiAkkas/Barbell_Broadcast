import { Ionicons } from '@expo/vector-icons'; // or use MaterialIcons, FontAwesome etc.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Dashboard from './Dashboard';
import Exercises from './Exercises';
import Profile from './Profile';
// import Social from './Social';
import SocialTabs from './SocialTabs';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Exercises') {
              iconName = focused ? 'barbell' : 'barbell-outline';
            }
            else if (route.name === 'Socials') {
            iconName = focused ? 'people' : 'people-outline';
          }
             else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00796b',
          tabBarInactiveTintColor: 'gray',
          //tabBarStyle: route.name === 'Socials' ? { display: 'none' } : {},
        })}
      >
        <Tab.Screen name="Home" component={Dashboard} />
        <Tab.Screen name="Exercises" component={Exercises} />
        <Tab.Screen name="Socials" component={SocialTabs} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
