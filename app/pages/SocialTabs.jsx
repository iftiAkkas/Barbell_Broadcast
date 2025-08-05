import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import AddPost from './AddPost';
import HomeStack from './SocialHomeStack';
import SocialMessagesTabs from './SocialMessagesTabs';

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
          height: 80, // ⬆️ Increased height
          paddingBottom: Platform.OS === 'ios' ? 20 : 10, // iOS safe padding
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="AddPost"
        component={AddPost}
        options={{
          tabBarButton: (props) => <FloatingAddButton {...props} />,
          tabBarLabel: () => null, // Hide label under FAB
        }}
      />

      <Tab.Screen
        name="Messages"
        component={SocialMessagesTabs}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Messages',
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
    top: -30, // ⬆️ Ensures it appears above tab bar
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
});
