import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileImage from '../components/profileImage';
import Profile from './Profile';

// Your screens
import HomeScreen from '../screens/HomeScreen';
import ExerciseLogScreen from '../screens/ExerciseLogScreen';
import ExerciseGraphScreen from '../screens/ExerciseGraphScreen';
import CustomTrackerScreen from '../screens/CustomTrackerScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import RoutineScreen from '../screens/RoutineScreen';
import TrackerListScreen from '../screens/TrackerListScreen';

const Stack = createNativeStackNavigator();

export default function Omi() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <ProfileImage onPress={() => navigation.navigate('Profile')} />
        ),
        headerTitleAlign: 'center',
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ExerciseLog" component={ExerciseLogScreen} />
      <Stack.Screen name="ExerciseGraph" component={ExerciseGraphScreen} />
      <Stack.Screen name="CustomTracker" component={CustomTrackerScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Routine" component={RoutineScreen} />
      <Stack.Screen name="TrackerList" component={TrackerListScreen} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
