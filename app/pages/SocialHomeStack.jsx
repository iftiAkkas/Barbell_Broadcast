// navigation/HomeStack.js
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
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
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('AddPost')}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={22} color="#00796b" />
              <Text style={styles.headerText}>Create Post</Text>
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerTitle: '', // No other title
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 3,
            shadowOpacity: 0.2,
          },
        })}
      />
      <Stack.Screen
        name="AddPost"
        component={AddPost}
        options={{ title: 'Back' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#00796b',
    marginLeft: 6,
  },
});

export default HomeStack;
