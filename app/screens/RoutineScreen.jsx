// ✅ Final RoutineScreen.js with keyboard fix, separator between exercises, and dayData check

import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutineScreen() {
  const [creating, setCreating] = useState(false);
  const [routineTitle, setRoutineTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [routine, setRoutine] = useState(null);
  const [dayData, setDayData] = useState({});

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        const saved = await AsyncStorage.getItem('routine');
        if (saved) {
          const parsed = JSON.parse(saved);
          setRoutine(parsed);
          setRoutineTitle(parsed.title);
        }
      } catch (e) {
        console.error('❌ Failed to load routine:', e);
      }
    };
    loadRoutine();
  }, []);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
      const updated = { ...dayData };
      delete updated[day];
      setDayData(updated);
    } else {
      setSelectedDays([...selectedDays, day]);
      setDayData({
        ...dayData,
        [day]: { title: '', exercises: [''], sets: [''], reps: [''] },
      });
    }
  };

  const handleSave = async () => {
    const finalRoutine = {
      title: routineTitle,
      selectedDays,
      dayTitles: {},
      exercises: {},
      sets: {},
      reps: {},
    };

    selectedDays.forEach((day) => {
      if (!dayData[day]) return;
      finalRoutine.dayTitles[day] = dayData[day].title;

      const cleanExercises = dayData[day].exercises
        .map((ex, i) => ({
          ex: ex.trim(),
          sets: dayData[day].sets[i]?.toString().trim() || '0',
          reps: dayData[day].reps[i]?.toString().trim() || '0',
        }))
        .filter(item => item.ex !== '');

      finalRoutine.exercises[day] = cleanExercises.map(e => e.ex);
      finalRoutine.sets[day] = cleanExercises.map(e => parseInt(e.sets));
      finalRoutine.reps[day] = cleanExercises.map(e => parseInt(e.reps));
    });

    try {
      await AsyncStorage.setItem('routine', JSON.stringify(finalRoutine));
      setRoutine(finalRoutine);
      setCreating(false);
    } catch (e) {
      console.error('❌ Failed to save routine:', e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {!creating && !routine && (
          <TouchableOpacity style={styles.createBtn} onPress={() => setCreating(true)}>
            <Text style={styles.btnText}>Create A Routine</Text>
          </TouchableOpacity>
        )}

        {creating && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Routine Title"
              value={routineTitle}
              onChangeText={setRoutineTitle}
            />

            <Text style={styles.title}>Select Workout Days (Weekly)</Text>
            <View style={styles.daysContainer}>
              {daysOfWeek.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, selectedDays.includes(day) && styles.selected]}
                  onPress={() => toggleDay(day)}
                >
                  <Text>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedDays.map(day => {
              if (!dayData[day]) return null;
              return (
              <View key={day} style={styles.dayBlock}>
              <Text style={styles.subtitle}>{day}</Text>
              <TextInput
                style={styles.input}
                placeholder="Day Title (e.g. Push Day)"
                value={dayData[day].title}
                onChangeText={text =>
                  setDayData({ ...dayData, [day]: { ...dayData[day], title: text } })
                }
              />
              <View style={styles.separator} />

                  {dayData[day].exercises.map((_, idx) => (
                    <View key={idx}>
                      {idx > 0 && <View style={styles.exerciseSeparator} />}

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <TextInput
                            style={styles.input}
                            placeholder={`Exercise ${idx + 1}`}
                            value={dayData[day].exercises[idx]}
                            onChangeText={text => {
                              const updated = [...dayData[day].exercises];
                              updated[idx] = text;
                              setDayData({ ...dayData, [day]: { ...dayData[day], exercises: updated } });
                            }}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Sets"
                            value={dayData[day].sets[idx]}
                            onChangeText={text => {
                              const updated = [...dayData[day].sets];
                              updated[idx] = text;
                              setDayData({ ...dayData, [day]: { ...dayData[day], sets: updated } });
                            }}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Reps"
                            value={dayData[day].reps[idx]}
                            onChangeText={text => {
                              const updated = [...dayData[day].reps];
                              updated[idx] = text;
                              setDayData({ ...dayData, [day]: { ...dayData[day], reps: updated } });
                            }}
                          />
                        </View>

                        {dayData[day].exercises.length > 1 && (
                          <TouchableOpacity
                            onPress={() => {
                              const newEx = [...dayData[day].exercises];
                              const newSets = [...dayData[day].sets];
                              const newReps = [...dayData[day].reps];
                              newEx.splice(idx, 1);
                              newSets.splice(idx, 1);
                              newReps.splice(idx, 1);
                              setDayData({
                                ...dayData,
                                [day]: {
                                  ...dayData[day],
                                  exercises: newEx,
                                  sets: newSets,
                                  reps: newReps,
                                },
                              });
                            }}
                            style={styles.deleteBtnSmall}
                          >
                            <Text style={styles.deleteText}>❌</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => {
                      setDayData({
                        ...dayData,
                        [day]: {
                          ...dayData[day],
                          exercises: [...dayData[day].exercises, ''],
                          sets: [...dayData[day].sets, ''],
                          reps: [...dayData[day].reps, ''],
                        },
                      });
                    }}
                  >
                    <Text style={styles.addMore}>+ Add Exercise</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Save Routine</Text>
            </TouchableOpacity>
          </>
        )}

        {routine && !creating && (
          <>
            <Text style={styles.title}>{routine.title}</Text>
            {routine?.selectedDays?.map((day, i) => (
              <View key={i} style={styles.dayBlock}>
                <Text style={styles.subtitle}>
                  {day} - {routine.dayTitles?.[day] || ''}
                </Text>
                {(routine.exercises?.[day] || []).map((ex, j) => {
                  const setVal = routine.sets?.[day]?.[j] || '?';
                  const repVal = routine.reps?.[day]?.[j] || '?';

                  return (
                    <Text key={j} style={styles.exerciseLine}>
                      • {ex} ({setVal} sets × {repVal} reps)
                    </Text>
                  );
                })}
              </View>
            ))}

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setCreating(true);
                setRoutineTitle(routine.title);
                setSelectedDays(routine.selectedDays);
              const newDayData = {};
                routine.selectedDays.forEach(day => {
                  newDayData[day] = {
                    title: routine.dayTitles[day],
                    exercises: routine.exercises[day],
                    sets: (routine.sets?.[day] || []).map(String),
                    reps: (routine.reps?.[day] || []).map(String),
                  };
                });

                setDayData(newDayData);
              }}
            >
              <Text style={styles.btnText}>Edit Routine</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: '#f9fafb',
    fontSize: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    color: '#1e3a8a',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#2563eb',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 10,
  },
  exerciseSeparator: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 10,
    marginBottom: 30,
  },
  dayBlock: {
    marginVertical: 12,
    padding: 14,
    backgroundColor: '#e0f2fe',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    gap: 8,
  },
  dayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selected: {
    backgroundColor: '#c1e4fcff',
  },
  addMore: {
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  editBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  exerciseLine: {
    marginTop: 6,
    fontSize: 15,
    color: '#1e293b',
  },
  deleteBtnSmall: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
