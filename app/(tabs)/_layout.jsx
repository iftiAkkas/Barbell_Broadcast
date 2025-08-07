// app/(tabs)/_layout.js
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>

       <Tabs.Screen
        name="omi"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size*1.2} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'fitness' : 'fitness-outline'} size={size*1.2} color={color} />
          ),
        }}
      />
    
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'logo-instagram' : 'logo-instagram'} size={size*1.2} color={color} />
          ),
          tabBarStyle: { display: 'none' }, // hide tab bar for 'social'
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size*1.2} color={color} />
          ),
        }}
      />

       
    </Tabs>
  );
}
