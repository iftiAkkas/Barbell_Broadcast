import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExerciseLogScreen() {
  const [isEditing, setIsEditing] = useState(true);
  const [routine, setRoutine] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [log, setLog] = useState({});
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [additionalExercises, setAdditionalExercises] = useState([]);
  const [allLogs, setAllLogs] = useState({});

  useEffect(() => {
    loadRoutine();
    loadLogs();
  }, []);

  const loadRoutine = async () => {
    try {
      const stored = await AsyncStorage.getItem('routine');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRoutine(parsed);
      }
    } catch (e) {
      console.log('Error loading routine:', e);
    }
  };

  const loadLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem('logs');
      if (stored) {
        setAllLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error loading logs:', e);
    }
  };

  const updateSet = (exercise, idx, field, value) => {
    const sets = log[exercise] || [];
    sets[idx] = { ...sets[idx], [field]: value };
    setLog({ ...log, [exercise]: sets });
  };

  const addSet = (exercise) => {
    const sets = log[exercise] || [];
    setLog({ ...log, [exercise]: [...sets, { reps: '', weight: '' }] });
  };

  const addAdditionalSet = (index) => {
    const updated = [...additionalExercises];
    updated[index].sets.push({ reps: '', weight: '' });
    setAdditionalExercises(updated);
  };

  const addAdditionalExercise = () => {
    setAdditionalExercises([...additionalExercises, { name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const saveLog = async () => {
    try {
      const todayLog = {
        log,
        additionalExercises,
      };

      const updatedLogs = {
        ...allLogs,
        [logDate]: {
          ...(allLogs[logDate] || {}),
          [selectedDay]: todayLog,
        },
      };

      await AsyncStorage.setItem('logs', JSON.stringify(updatedLogs));
      setAllLogs(updatedLogs);
      setIsEditing(false);
      Alert.alert('Success', 'Workout log saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save log');
    }
  };

  const editLogEntry = (date) => {
    const entry = allLogs[date]?.[selectedDay];
    if (entry) {
      setLogDate(date);
      setLog(entry.log);
      setAdditionalExercises(entry.additionalExercises);
      setIsEditing(true);
    }
  };

  if (!routine) return null;

  const { selectedDays, dayTitles, exercises } = routine;
  const logsForDay = Object.entries(allLogs).filter(([, val]) => val[selectedDay]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select a Day</Text>
      <View style={styles.daysContainer}>
        {selectedDays.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === day && styles.daySelected]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={styles.dayButtonText}>{dayTitles?.[day] || day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedDay && (
  <>
    {[...logsForDay]
      .sort((a, b) => new Date(a[0]) - new Date(b[0])) // or flip to b[0]-a[0] for reverse
      .map(([date, val]) => {
        const entry = val[selectedDay];
        return (
          <View key={date} style={styles.logGroup}>
            <Text style={styles.logDate}>{date}</Text>
            {Object.entries(entry.log).map(([exName, sets], i) => (
              <View key={i} style={styles.exerciseBlock}>
                <Text style={styles.exerciseTitle}>{exName}</Text>
                {sets.map((s, idx) => (
                  <Text key={idx} style={styles.readOnlyText}>
                    Set {idx + 1}: {s.reps} reps × {s.weight} kg
                  </Text>
                ))}
              </View>
            ))}
            {entry.additionalExercises.map((ae, i) => (
              <View key={i} style={styles.exerciseBlock}>
                <Text style={styles.exerciseTitle}>{ae.name}</Text>
                {ae.sets.map((s, idx) => (
                  <Text key={idx} style={styles.readOnlyText}>
                    Set {idx + 1}: {s.reps} reps × {s.weight} kg
                  </Text>
                ))}
              </View>
            ))}
            <TouchableOpacity style={styles.editBtn} onPress={() => editLogEntry(date)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        );
      })}

          {!isEditing && (
            <TouchableOpacity
              style={styles.newLogBtn}
              onPress={() => {
                const emptyLog = {};
                (exercises[selectedDay] || []).forEach((ex) => {
                  emptyLog[ex] = [{ reps: '', weight: '' }];
                });
                setLog(emptyLog);
                setAdditionalExercises([]);
                setLogDate(new Date().toISOString().split('T')[0]);
                setIsEditing(true);
              }}
            >
              <Text style={styles.newLogText}>Add Today's Workout</Text>
            </TouchableOpacity>
          )}

          {isEditing && (
            <>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={logDate}
                onChangeText={setLogDate}
              />
              <Text style={styles.title}>Today's Exercises</Text>
              {exercises[selectedDay]?.map((exercise) => (
                <View key={exercise} style={styles.exerciseBlock}>
                  <Text style={styles.exerciseTitle}>{exercise}</Text>
                  {(log[exercise] || []).map((set, idx) => (
                    <View key={idx} style={styles.setRow}>
                      <TextInput
                        placeholder="Reps"
                        value={set.reps}
                        onChangeText={(text) => updateSet(exercise, idx, 'reps', text)}
                        style={styles.input}
                      />
                      <TextInput
                        placeholder="Weight"
                        value={set.weight}
                        onChangeText={(text) => updateSet(exercise, idx, 'weight', text)}
                        style={styles.input}
                      />
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => addSet(exercise)}>
                    <Text style={styles.addText}>+ Add Set</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.subtitle}>Additional Exercises</Text>
              {additionalExercises.map((ex, i) => (
                <View key={i} style={styles.exerciseBlock}>
                  <TextInput
                    placeholder="Exercise Name"
                    value={ex.name}
                    onChangeText={(text) => {
                      const updated = [...additionalExercises];
                      updated[i].name = text;
                      setAdditionalExercises(updated);
                    }}
                    style={styles.input}
                  />
                  {ex.sets.map((set, idx) => (
                    <View key={idx} style={styles.setRow}>
                      <TextInput
                        placeholder="Reps"
                        value={set.reps}
                        onChangeText={(text) => {
                          const updated = [...additionalExercises];
                          updated[i].sets[idx].reps = text;
                          setAdditionalExercises(updated);
                        }}
                        style={styles.input}
                      />
                      <TextInput
                        placeholder="Weight"
                        value={set.weight}
                        onChangeText={(text) => {
                          const updated = [...additionalExercises];
                          updated[i].sets[idx].weight = text;
                          setAdditionalExercises(updated);
                        }}
                        style={styles.input}
                      />
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => addAdditionalSet(i)}>
                    <Text style={styles.addText}>+ Add Set</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addAdditionalExercise}>
                <Text style={styles.addText}>+ Add Additional Exercise</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
                <Text style={styles.saveText}>Save Workout</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f2f2' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 20 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  dayButton: {
    padding: 10,
    margin: 5,
    borderRadius: 6,
    backgroundColor: '#eee',
    borderWidth: 1,
  },
  daySelected: { backgroundColor: '#a0e1e5', borderColor: '#007bff' },
  dayButtonText: { fontWeight: '600' },
  exerciseBlock: { marginBottom: 16 },
  exerciseTitle: { fontSize: 16, fontWeight: '600' },
  setRow: { flexDirection: 'row', justifyContent: 'space-between' },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 4,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    backgroundColor: '#fff',
  },
  addText: { color: '#007bff', marginVertical: 4 },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
  editBtn: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10,
    width: 100,
    alignSelf: 'flex-start',
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  readOnlyText: {
    fontSize: 16,
    marginVertical: 4,
  },
  newLogBtn: {
    backgroundColor: '#6c63ff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10,
  },
  newLogText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logGroup: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  logDate: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
});
