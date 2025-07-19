import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getTodayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const getDateKey = () => {
  return new Date().toISOString().split('T')[0]; // yyyy-mm-dd
};

export default function ExerciseLogScreen() {
  const [todayRoutine, setTodayRoutine] = useState([]);
  const [log, setLog] = useState({});
  const [additionalExercises, setAdditionalExercises] = useState([]);

  useEffect(() => {
    loadRoutine();
  }, []);

  const loadRoutine = async () => {
    try {
      const stored = await AsyncStorage.getItem('routine');
      if (stored) {
        const { exercises } = JSON.parse(stored);
        const today = getTodayName();
        setTodayRoutine(exercises[today] || []);
      }
    } catch (e) {
      console.log('Error loading routine', e);
    }
  };

  const addSet = (exercise) => {
    const sets = log[exercise] || [];
    setLog({ ...log, [exercise]: [...sets, { reps: '', weight: '' }] });
  };

  const updateSet = (exercise, index, field, value) => {
    const updated = [...(log[exercise] || [])];
    updated[index][field] = value;
    setLog({ ...log, [exercise]: updated });
  };

  const saveLog = async () => {
    try {
      const entry = { log, additionalExercises };
      await AsyncStorage.setItem(`log-${getDateKey()}`, JSON.stringify(entry));
      Alert.alert('Saved', 'Workout log saved!');
    } catch (e) {
      Alert.alert('Error', 'Could not save log');
    }
  };

  const addAdditional = () => {
    setAdditionalExercises([...additionalExercises, { name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const updateAdditional = (index, field, value) => {
    const updated = [...additionalExercises];
    updated[index][field] = value;
    setAdditionalExercises(updated);
  };

  const updateAdditionalSet = (index, setIndex, field, value) => {
    const updated = [...additionalExercises];
    updated[index].sets[setIndex][field] = value;
    setAdditionalExercises(updated);
  };

  const addAdditionalSet = (index) => {
    const updated = [...additionalExercises];
    updated[index].sets.push({ reps: '', weight: '' });
    setAdditionalExercises(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Exercises</Text>
      {todayRoutine.map((exercise) => (
        <View key={exercise} style={styles.exerciseBlock}>
          <Text style={styles.exerciseTitle}>{exercise}</Text>
          {(log[exercise] || []).map((set, idx) => (
            <View key={idx} style={styles.setRow}>
              <TextInput
                placeholder="Reps"
                value={set.reps}
                onChangeText={(text) => updateSet(exercise, idx, 'reps', text)}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Weight"
                value={set.weight}
                onChangeText={(text) => updateSet(exercise, idx, 'weight', text)}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity onPress={() => addSet(exercise)}>
            <Text style={styles.addSet}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.subtitle}>Additional Exercises</Text>
      {additionalExercises.map((ex, i) => (
        <View key={i} style={styles.exerciseBlock}>
          <TextInput
            placeholder="Exercise Name"
            value={ex.name}
            onChangeText={(text) => updateAdditional(i, 'name', text)}
            style={styles.input}
          />
          {ex.sets.map((set, j) => (
            <View key={j} style={styles.setRow}>
              <TextInput
                placeholder="Reps"
                value={set.reps}
                onChangeText={(text) => updateAdditionalSet(i, j, 'reps', text)}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Weight"
                value={set.weight}
                onChangeText={(text) => updateAdditionalSet(i, j, 'weight', text)}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity onPress={() => addAdditionalSet(i)}>
            <Text style={styles.addSet}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addAdditional}>
        <Text style={styles.addSet}>+ Add Additional Exercise</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
        <Text style={styles.saveText}>Save Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20 },
  exerciseBlock: { marginBottom: 20 },
  exerciseTitle: { fontSize: 16, fontWeight: '500' },
  setRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    flex: 1,
    backgroundColor: '#fff',
  },
  addSet: { color: '#007bff', marginTop: 6 },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
