import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [routineName, setRoutineName] = useState('');
  const [lastWorkout, setLastWorkout] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const routines = JSON.parse(await AsyncStorage.getItem('routines')) || [];
        const index = await AsyncStorage.getItem('currentRoutineIndex');

        if (routines.length && index !== null) {
          const currentRoutine = routines[parseInt(index, 10)];
          setRoutineName(currentRoutine?.title || '');
        }

        const logs = JSON.parse(await AsyncStorage.getItem('workoutLogs')) || {};
        const allDates = Object.keys(logs);
        if (allDates.length) {
          const latest = allDates.sort().reverse()[0];
          setLastWorkout(latest);
        }

      } catch (e) {
        console.log('Home screen load error:', e);
      }
    };

    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barbell Broadcast</Text>

      {/* {lastWorkout ? (
        <Text style={styles.info}>Last Workout: <Text style={styles.bold}>{lastWorkout}</Text></Text>
      ) : (
        <Text style={styles.info}></Text>
      )} */}

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Routine')}>
        <Text style={styles.btnText}>Routine Setup</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ExerciseLog')}>
        <Text style={styles.btnText}>Workout Log</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  info: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  bold: { fontWeight: 'bold' },
  btn: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    marginTop: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
