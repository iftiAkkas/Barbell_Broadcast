import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import AddPost from './AddPost';
import SocialHomeScreen from './SocialHome';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={SocialHomeScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#fff',
                textAlign: 'center',
                width: '100%',
              }}
            >
              News Feed
            </Text>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ paddingHorizontal: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#3b82f6',
            height: 110,
            elevation: 3,
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          },
        })}
      />

      <Stack.Screen
        name="AddPost"
        component={AddPost}
        options={({ navigation }) => ({
          headerTitle: 'Add Post',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 18,
            color: '#3b82f6',
            fontWeight: 'bold',
          },
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 2,
            shadowOpacity: 0.1,
          },
        })}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
