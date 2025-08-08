import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function ExerciseLogScreen({ navigation }) {
  const [routine, setRoutine] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [log, setLog] = useState({});
  const [additionalExercises, setAdditionalExercises] = useState([]);
  const [logsForDay, setLogsForDay] = useState([]);
  const [isEditing, setIsEditing] = useState(true);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const loadRoutine = async () => {
      const stored = await AsyncStorage.getItem('routine');
      if (stored) setRoutine(JSON.parse(stored));
    };
    loadRoutine();
  }, []);

  useEffect(() => {
    if (routine && selectedDay && logDate) {
      loadLog();
      loadLogsForDay();
    }
  }, [routine, selectedDay, logDate]);

  const loadLog = async () => {
    const stored = await AsyncStorage.getItem('logs');
    const all = stored ? JSON.parse(stored) : {};
    const entry = all[logDate]?.[selectedDay];

    if (entry) {
      setLog(entry.log || {});
      setAdditionalExercises(entry.additionalExercises || []);
      setIsEditing(false);
    } else {
      const base = {};
      (routine?.exercises[selectedDay] || []).forEach((ex) => {
        base[ex] = [{ reps: '', weight: '' }];
      });
      setLog(base);
      setAdditionalExercises([]);
      setIsEditing(true);
    }
  };

  const loadLogsForDay = async () => {
    const stored = await AsyncStorage.getItem('logs');
    const all = stored ? JSON.parse(stored) : {};
    const filtered = Object.entries(all).filter(([_, val]) => val[selectedDay]);
    setLogsForDay(filtered);
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

  const saveLog = async () => {
    const stored = await AsyncStorage.getItem('logs');
    const all = stored ? JSON.parse(stored) : {};

    const todayLog = { log, additionalExercises };
    all[logDate] = {
      ...(all[logDate] || {}),
      [selectedDay]: todayLog,
    };

    await AsyncStorage.setItem('logs', JSON.stringify(all));
    setIsEditing(false);
    Alert.alert('Saved', 'Workout saved!');
    loadLogsForDay();
  };

  const addAdditionalExercise = () => {
    setAdditionalExercises([...additionalExercises, { name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const addAdditionalSet = (i) => {
    const temp = [...additionalExercises];
    temp[i].sets.push({ reps: '', weight: '' });
    setAdditionalExercises(temp);
  };

  const editLogEntry = (date) => {
    AsyncStorage.getItem('logs').then((stored) => {
      const all = stored ? JSON.parse(stored) : {};
      const entry = all[date]?.[selectedDay];
      if (entry) {
        setLogDate(date);
        setLog(entry.log || {});
        setAdditionalExercises(entry.additionalExercises || []);
        setIsEditing(true);
      }
    });
  };

  const deleteLogEntry = async (date) => {
    Alert.alert('Delete Log', `Delete log for ${date}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const stored = await AsyncStorage.getItem('logs');
          const all = stored ? JSON.parse(stored) : {};

          if (all[date] && all[date][selectedDay]) {
            delete all[date][selectedDay];
            if (Object.keys(all[date]).length === 0) delete all[date];

            await AsyncStorage.setItem('logs', JSON.stringify(all));
            loadLogsForDay();
            Alert.alert('Deleted', `Log for ${date} deleted.`);
          }
        },
      },
    ]);
  };

  if (!routine) return null;

  const { selectedDays, dayTitles, exercises } = routine;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
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
            <TouchableOpacity
              onPress={() => setDatePickerVisibility(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateText}>Log Date: {logDate}</Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              date={new Date(logDate)}
              onConfirm={(date) => {
                const newDate = date.toISOString().split('T')[0];
                setLogDate(newDate);
                setDatePickerVisibility(false);
              }}
              onCancel={() => setDatePickerVisibility(false)}
            />

            <Text style={styles.subtitle}>Exercises</Text>
            {Object.entries(log).map(([ex, sets], i) => (
              <View key={i} style={styles.exerciseBlock}>
                <Text style={styles.exerciseTitle}>{ex}</Text>
                {sets.map((s, idx) => (
                  <View key={idx} style={styles.setRow}>
                    {isEditing ? (
                      <>
                        <TextInput
                          value={s.reps}
                          placeholder="Reps"
                          onChangeText={(t) => updateSet(ex, idx, 'reps', t)}
                          style={styles.input}
                          keyboardType="numeric"
                        />
                        <TextInput
                          value={s.weight}
                          placeholder="Weight"
                          onChangeText={(t) => updateSet(ex, idx, 'weight', t)}
                          style={styles.input}
                          keyboardType="numeric"
                        />
                      </>
                    ) : (
                      <Text style={styles.readOnlyText}>
                        Set {idx + 1}: {s.reps} reps × {s.weight} kg
                      </Text>
                    )}
                  </View>
                ))}
                {isEditing && (
                  <TouchableOpacity onPress={() => addSet(ex)}>
                    <Text style={styles.addText}>+ Add Set</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.separator} />
              </View>
            ))}

            <Text style={styles.subtitle}>Additional Exercises</Text>
            {additionalExercises.map((ae, i) => (
              <View key={i} style={styles.exerciseBlock}>
                {isEditing ? (
                  <TextInput
                    placeholder="Exercise Name"
                    value={ae.name}
                    onChangeText={(text) => {
                      const updated = [...additionalExercises];
                      updated[i].name = text;
                      setAdditionalExercises(updated);
                    }}
                    style={styles.input}
                  />
                ) : (
                  <Text style={styles.exerciseTitle}>{ae.name}</Text>
                )}
                {ae.sets.map((set, idx) => (
                  <View key={idx} style={styles.setRow}>
                    {isEditing ? (
                      <>
                        <TextInput
                          value={set.reps}
                          placeholder="Reps"
                          onChangeText={(text) => {
                            const updated = [...additionalExercises];
                            updated[i].sets[idx].reps = text;
                            setAdditionalExercises(updated);
                          }}
                          style={styles.input}
                          keyboardType="numeric"
                        />
                        <TextInput
                          value={set.weight}
                          placeholder="Weight"
                          onChangeText={(text) => {
                            const updated = [...additionalExercises];
                            updated[i].sets[idx].weight = text;
                            setAdditionalExercises(updated);
                          }}
                          style={styles.input}
                          keyboardType="numeric"
                        />
                      </>
                    ) : (
                      <Text style={styles.readOnlyText}>
                        Set {idx + 1}: {set.reps} reps × {set.weight} kg
                      </Text>
                    )}
                  </View>
                ))}
                {isEditing && (
                  <TouchableOpacity onPress={() => addAdditionalSet(i)}>
                    <Text style={styles.addText}>+ Add Set</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.separator} />
              </View>
            ))}

            {isEditing && (
              <TouchableOpacity onPress={addAdditionalExercise}>
                <Text style={styles.addText}>+ Add Additional Exercise</Text>
              </TouchableOpacity>
            )}

            {isEditing ? (
              <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
                <Text style={styles.saveText}>Save Workout</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                  <Text style={styles.saveText}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.subtitle}>Previous Logs</Text>
{logsForDay
  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
  .map(([date, entry], i) => {
    const val = entry[selectedDay];
    if (!val) return null;

    return (
      <View key={i} style={styles.logCard}>
        <Text style={styles.logDate}>{date}</Text>

        {/* Main Exercises */}
        {Object.entries(val.log || {}).map(([ex, sets], j) => (
          <TouchableOpacity
            key={j}
            onPress={() =>
              navigation.navigate('ExerciseGraph', {
                exerciseName: ex,
                logsForDay: logsForDay,
                selectedDay: selectedDay,
              })
            }
          >
            <Text style={styles.logExercise}>
              {ex}: {sets.map((s, si) => `Set ${si + 1}: ${s.reps}x${s.weight}`).join(', ')}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Additional Exercises */}
        {(val.additionalExercises || []).map((ae, j) => (
          <Text key={`ae-${j}`} style={styles.logExercise}>
            {ae.name}: {ae.sets.map((s, si) => `Set ${si + 1}: ${s.reps}x${s.weight}`).join(', ')}
          </Text>
        ))}

        {/* Edit / Delete Buttons */}
        <View style={styles.logButtonRow}>
          <TouchableOpacity style={styles.editBtnSmall} onPress={() => editLogEntry(date)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtnSmall} onPress={() => deleteLogEntry(date)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  })}

          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003366',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#003366',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayButton: {
    padding: 10,
    margin: 5,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  daySelected: {
    backgroundColor: '#007bff',
  },
  dayButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#d0e7ff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontWeight: '600',
    color: '#003366',
  },
  exerciseBlock: {
    marginBottom: 16,
  },
  exerciseTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#003366',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  addText: {
    color: '#007bff',
    fontWeight: 'bold',
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editBtn: {
    backgroundColor: '#07d2ffff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  readOnlyText: {
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 10,
  },
  logCard: {
  backgroundColor: '#fff',
  padding: 12,
  borderRadius: 8,
  marginBottom: 16,
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 2 },
},
logExercise: {
  fontSize: 15,
  color: '#007bff',
  marginVertical: 2,
},
logButtonRow: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  marginTop: 10,
  gap: 10,
},

});
