import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Text } from 'react-native';
import AddPost from './AddPost';
import SocialHomeScreen from './SocialHome';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={SocialHomeScreen}
        options={{
          // ✅ Use a custom headerTitle component to ensure perfect centering
          headerTitle: () => (
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#3b82f6',
                textAlign: 'right',
                width: '100%',
              }}
            >
              News Feed
            </Text>
          ),
          headerLeft: () => null, 
          headerTitleAlign: 'center', // Still keep this
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 3,
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          },
        }}
      />
      <Stack.Screen
        name="AddPost"
        component={AddPost}
        options={{
          title: 'Back',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 18,
            color: '#00796b',
          },
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 2,
            shadowOpacity: 0.1,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
