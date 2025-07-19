import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Welcome to Barbell Broadcast</Text>
      <Button title="Go to Routine Setup" onPress={() => navigation.navigate('Routine')} />
      <Button title="Go to Exercise Log" onPress={() => navigation.navigate('ExerciseLog')} />

    </View>
  );
}
