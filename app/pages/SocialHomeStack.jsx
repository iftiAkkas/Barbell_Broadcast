import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import SocialHomeScreen from './SocialHome';
import AddPost from './AddPost';

const Stack = createStackNavigator();

function WrappedNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingTop: insets.top, // ensures safe top padding dynamically
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#3b82f6"
        translucent={false}
      />
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#3b82f6',
            elevation: 3,
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            // Remove fixed height for better flexibility
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerLeft: () => (
            navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ paddingHorizontal: 16 }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )
          ),
        })}
      >
        <Stack.Screen
          name="HomeMain"
          component={SocialHomeScreen}
          options={{
            headerTitle: 'News Feed',
          }}
        />
        <Stack.Screen
          name="AddPost"
          component={AddPost}
          options={{
            headerTitle: 'Add Post',
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 2,
              shadowOpacity: 0.1,
            },
            headerTitleStyle: {
              color: '#3b82f6',
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTintColor: '#3b82f6',
            headerLeft: null, // or custom back button
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

export default function HomeStack() {
  return (
    <SafeAreaProvider>
      <WrappedNavigator />
    </SafeAreaProvider>
  );
}
