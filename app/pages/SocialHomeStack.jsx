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
          headerTitle: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPost')}
              activeOpacity={0.7}
            >
            <Text style={styles.headerTitle}>Create Post</Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPost')}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={28} color="#00796b" />
            </TouchableOpacity>
          ),
          headerBackVisible: false, // ✅ Hides the back button
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  addButton: {
    marginLeft: 15,
    
  },
});

export default HomeStack;
