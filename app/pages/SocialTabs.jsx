import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import AddPost from './AddPost';
import HomeStack from './SocialHomeStack';
import SocialMessagesTabs from './SocialMessagesTabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function SocialTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#fff',
          height: 80,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="AddPost"
        component={AddPost}
        options={{
          tabBarButton: (props) => <FloatingAddButton {...props} />,
          tabBarLabel: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="Messages"
        component={SocialMessagesTabs}
        options={({ route }) => {
          // Get the currently focused route name in the nested SocialMessagesTabs
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Community';

          return {
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'chatbubble' : 'chatbubble-outline'}
                size={size}
                color={color}
              />
            ),
            tabBarLabel: 'Messages',

            // Hide tab bar when inside Community or Private top tabs
            tabBarStyle: {
              display: routeName === 'Community' || routeName === 'Private' ? 'none' : 'flex',
              position: 'absolute', // keep absolute positioning for the tab bar
              backgroundColor: '#fff',
              height: 80,
              paddingBottom: Platform.OS === 'ios' ? 20 : 10,
              borderTopWidth: 0,
              elevation: 5,
            },
          };
        }}
      />
    </Tab.Navigator>
  );
}

function FloatingAddButton({ onPress }) {
  return (
    <View style={styles.fabWrapper}>
      <TouchableOpacity
        style={styles.fab}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
});
