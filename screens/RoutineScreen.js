import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RoutineScreen() {
  const [routineTitle, setRoutineTitle] = useState('');
  const [routines, setRoutines] = useState([]);
  const [isEditing, setIsEditing] = useState(true);

  const [selectedDays, setSelectedDays] = useState([]);
  const [exercises, setExercises] = useState({});
  const [dayTitles, setDayTitles] = useState({});
  const [daySets, setDaySets] = useState({});
  const [dayReps, setDayReps] = useState({});

  useEffect(() => {
    const loadRoutines = async () => {
      const stored = await AsyncStorage.getItem('routines');
      if (stored) setRoutines(JSON.parse(stored));
    };
    loadRoutines();
  }, []);

  const saveRoutine = async () => {
    try {
      const newRoutine = {
        title: routineTitle || `Routine ${routines.length + 1}`,
        selectedDays,
        exercises,
        dayTitles,
        daySets,
        dayReps,
      };

      const existing = await AsyncStorage.getItem('routines');
      const parsed = existing ? JSON.parse(existing) : [];

      const updatedRoutines = [...parsed, newRoutine];
      await AsyncStorage.setItem('routines', JSON.stringify(updatedRoutines));

      setRoutines(updatedRoutines);
      setIsEditing(false);
      Alert.alert('Success', 'Routine saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save routine');
    }
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
      const newExercises = { ...exercises };
      const newTitles = { ...dayTitles };
      const newSets = { ...daySets };
      const newReps = { ...dayReps };
      delete newExercises[day];
      delete newTitles[day];
      delete newSets[day];
      delete newReps[day];

      setExercises(newExercises);
      setDayTitles(newTitles);
      setDaySets(newSets);
      setDayReps(newReps);
    } else {
      setSelectedDays([...selectedDays, day]);
      setExercises({ ...exercises, [day]: [] });
      setDayTitles({ ...dayTitles, [day]: '' });
      setDaySets({ ...daySets, [day]: '' });
      setDayReps({ ...dayReps, [day]: '' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isEditing ? (
        <>
          <Text style={styles.label}>Routine Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter routine title"
            value={routineTitle}
            onChangeText={setRoutineTitle}
          />

          <Text style={styles.title}>Select Workout Days</Text>
          <View style={styles.daysContainer}>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, selectedDays.includes(day) && styles.daySelected]}
                onPress={() => toggleDay(day)}
              >
                <Text>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedDays.map(day => (
            <View key={day} style={styles.daySection}>
              <Text style={styles.dayTitle}>{day} Exercises</Text>

              <TextInput
                style={styles.input}
                placeholder="Custom title (e.g., Chest Day)"
                value={dayTitles[day] || ''}
                onChangeText={(text) => setDayTitles({ ...dayTitles, [day]: text })}
              />

              {exercises[day]?.map((ex, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <TextInput
                    style={styles.input}
                    placeholder={`Exercise ${i + 1}`}
                    value={ex}
                    onChangeText={(text) => {
                      const updated = [...exercises[day]];
                      updated[i] = text;
                      setExercises({ ...exercises, [day]: updated });
                    }}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Target Sets"
                    keyboardType="numeric"
                    value={daySets[day]?.[i] || ''}
                    onChangeText={(text) => {
                      const updated = [...(daySets[day] || [])];
                      updated[i] = text;
                      setDaySets({ ...daySets, [day]: updated });
                    }}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Rep Range (e.g. 8-10)"
                    value={dayReps[day]?.[i] || ''}
                    onChangeText={(text) => {
                      const updated = [...(dayReps[day] || [])];
                      updated[i] = text;
                      setDayReps({ ...dayReps, [day]: updated });
                    }}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  setExercises({ ...exercises, [day]: [...(exercises[day] || []), ''] });
                  setDaySets({ ...daySets, [day]: [...(daySets[day] || []), ''] });
                  setDayReps({ ...dayReps, [day]: [...(dayReps[day] || []), ''] });
                }}
              >
                <Text style={styles.addText}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.saveBtn} onPress={saveRoutine}>
            <Text style={styles.saveText}>Save Routine</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Saved Routine: {routineTitle}</Text>
         {!isEditing ? (
  <View>
    <Text style={styles.savedTitle}>Saved Routine: {routineTitle}</Text>

    {selectedDays.map(day => (
      <View key={day} style={styles.daySection}>
        <Text style={styles.dayTitle}>
          {dayTitles[day] || day}
        </Text>

        {(exercises[day] || []).map((exercise, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={styles.exerciseText}>
              {exercise}
            </Text>
            <Text style={styles.setRepText}>
              Sets: {daySets[day]?.[i] || '-'}, Reps: {dayReps[day]?.[i] || '-'}
            </Text>
          </View>
        ))}
      </View>
    ))}

    <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
      <Text style={styles.editText}>Edit Routine</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.newBtn}
      onPress={() => {
        setRoutineTitle('');
        setSelectedDays([]);
        setExercises({});
        setDayTitles({});
        setDaySets({});
        setDayReps({});
        setIsEditing(true);
      }}
    >
      <Text style={styles.newText}>Add New Routine</Text>
    </TouchableOpacity>
  </View>
) : (
  <>
    {/* your input form already here */}
  </>
)}

        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  dayButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  daySelected: { backgroundColor: '#a0e1e5' },
  daySection: { marginTop: 20 },
  dayTitle: { fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    marginVertical: 4,
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  addBtn: { marginVertical: 6 },
  addText: { color: '#007bff' },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  editBtn: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  savedTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
},

exerciseText: {
  fontSize: 16,
  fontWeight: '600',
},

setRepText: {
  fontSize: 14,
  color: '#555',
},

newBtn: {
  backgroundColor: '#6c63ff',
  padding: 12,
  borderRadius: 6,
  alignItems: 'center',
  marginTop: 12,
},

newText: {
  color: '#fff',
  fontWeight: 'bold',
},

});
