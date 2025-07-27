//Issues to fix

//If some exercise is not done, still 1 set is displayed
//Screen bottom needs padding

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
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
    const loadAll = async () => {
      const stored = await AsyncStorage.getItem('routine');
      if (stored) {
        setRoutine(JSON.parse(stored));
      }
    };
    loadAll();
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
    const filtered = Object.entries(all).filter(
      ([_, val]) => val[selectedDay]
    );
    setLogsForDay(filtered);
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

  const updateSet = (exercise, idx, field, value) => {
    const sets = log[exercise] || [];
    sets[idx] = { ...sets[idx], [field]: value };
    setLog({ ...log, [exercise]: sets });
  };

  const addSet = (exercise) => {
    const sets = log[exercise] || [];
    setLog({ ...log, [exercise]: [...sets, { reps: '', weight: '' }] });
  };

  const addAdditionalSet = (i) => {
    const temp = [...additionalExercises];
    temp[i].sets.push({ reps: '', weight: '' });
    setAdditionalExercises(temp);
  };

  const addAdditionalExercise = () => {
    setAdditionalExercises([...additionalExercises, { name: '', sets: [{ reps: '', weight: '' }] }]);
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

  const deleteLogEntry = (date) => {
    Alert.alert(
      'Delete Log',
      `Are you sure you want to delete the log for ${date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const stored = await AsyncStorage.getItem('logs');
              const all = stored ? JSON.parse(stored) : {};

              if (all[date] && all[date][selectedDay]) {
                delete all[date][selectedDay];
                if (Object.keys(all[date]).length === 0) {
                  delete all[date];
                }

                await AsyncStorage.setItem('logs', JSON.stringify(all));
                loadLogsForDay();
                Alert.alert('Deleted', `Log for ${date} deleted.`);
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to delete log.');
            }
          },
        },
      ]
    );
  };

  if (!routine) return null;

  const { selectedDays, dayTitles, exercises } = routine;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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

        {/* Date Picker */}
  <View style={{ marginBottom: 10, alignItems: 'center' }}>
  <TouchableOpacity
    onPress={() => setDatePickerVisibility(true)}
    style={{
      backgroundColor: '#ddd',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 6,
    }}
  >
    <Text style={styles.dateText}>Log Date: {logDate}</Text>
  </TouchableOpacity>

  <DateTimePickerModal
    isVisible={isDatePickerVisible}
    mode="date"
    date={new Date(logDate)}
    onConfirm={(selectedDate) => {
      const newDate = selectedDate.toISOString().split('T')[0];
      setLogDate(newDate);
      setDatePickerVisibility(false);
    }}
    onCancel={() => setDatePickerVisibility(false)}
  />
</View>



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
                      />
                      <TextInput
                        value={s.weight}
                        placeholder="Weight"
                        onChangeText={(t) => updateSet(ex, idx, 'weight', t)}
                        style={styles.input}
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
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.newLogBtn}
                onPress={() => {
                  const emptyLog = {};
                  (exercises[selectedDay] || []).forEach((ex) => {
                    emptyLog[ex] = [{ reps: '', weight: '' }];
                  });
                  setLog(emptyLog);
                  setAdditionalExercises([]);
                  setIsEditing(true);
                }}
              >
                <Text style={styles.newLogText}>Add Today’s Workout</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.subtitle}>Previous Logs</Text>
          {logsForDay.sort((a, b) => new Date(b[0]) - new Date(a[0]))

  .map(([date, entry], i) => {
            const val = entry[selectedDay];
            if (!val) return null;

            return (
              <View key={i} style={styles.exerciseBlock}>
                <Text style={styles.logDate}>{date}</Text>

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
  <Text style={[styles.readOnlyText, { color: '#007bff' }]}>
    {ex}: {sets.map((s, si) => `Set ${si + 1}: ${s.reps}x${s.weight}`).join(', ')}
  </Text>
</TouchableOpacity>

                ))}

                {(val.additionalExercises || []).map((ae, j) => (
                  <Text key={`ae-${j}`} style={styles.readOnlyText}>
                    {ae.name}: {ae.sets.map((s, si) => `Set ${si + 1}: ${s.reps}x${s.weight}`).join(', ')}
                  </Text>
                ))}

                <View style={{ flexDirection: 'row', marginTop: 8 }}>
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
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 20,
  },
  editBtnSmall: {
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 10,
  },
  deleteBtnSmall: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editText: { color: '#fff', fontWeight: 'bold' },
  deleteText: { color: '#fff', fontWeight: 'bold' },
  readOnlyText: { fontSize: 16, marginVertical: 4 },
  newLogBtn: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  newLogText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logDate: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
dateText: {
  fontSize: 16,
  color: '#000',
  fontWeight: '600',
},


});
