import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RoutineScreen from './screens/RoutineScreen'; 
import ExerciseLogScreen from './screens/ExerciseLogScreen';
import TrackerListScreen from './screens/TrackerListScreen';
import CustomTrackerScreen from './screens/CustomTrackerScreen';
import PersonalInfoScreen from './screens/PersonalInfoScreen'; 
import ExerciseGraphScreen from './screens/ExerciseGraphScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Routine" component={RoutineScreen} />
        <Stack.Screen name="ExerciseLog" component={ExerciseLogScreen} options={{ title: 'Workout Log' }}/>
          <Stack.Screen name="TrackerList" component={TrackerListScreen} options={{ title: 'Trackers' }}/>
  <Stack.Screen name="CustomTracker" component={CustomTrackerScreen} options={{ title: 'Tracker' }}/>
    <Stack.Screen name="ExerciseGraph" component={ExerciseGraphScreen} options={{title: 'Progress'}} />
    <Stack.Screen name="Personal Info" component={PersonalInfoScreen} options={{ title: 'Personal Info' }}
    
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
