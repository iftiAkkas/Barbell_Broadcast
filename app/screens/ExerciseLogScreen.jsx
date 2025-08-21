import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';


export default function ExerciseLogScreen({ navigation }) {
  const scrollRef = useRef(null);
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
  if (routine && selectedDay) {
    loadLog();
  }
}, [routine, selectedDay]);


useEffect(() => {
  if (routine && selectedDay && logDate) {
    loadLogsForDay();
  }
}, [routine, selectedDay, logDate]);


const loadLog = async () => {
  const base = {};
  (routine?.exercises[selectedDay] || []).forEach((ex) => {
    base[ex] = [{ reps: '', weight: '' }];
  });
  setLog(base);
  setAdditionalExercises([]);
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

  const cleanedLog = {};
  Object.entries(log).forEach(([exercise, sets]) => {
    const validSets = (sets || []).filter((s) => {
      const reps = String(s?.reps ?? '').trim();
      const weight = String(s?.weight ?? '').trim();
      return reps !== '' || weight !== '';
    });
    if (validSets.length > 0) cleanedLog[exercise] = validSets;
  });

  const cleanedAdditional = (additionalExercises || [])
    .map((ae) => ({
      ...ae,
      name: String(ae?.name ?? ''),
      sets: (ae?.sets ?? []).filter((s) => {
        const reps = String(s?.reps ?? '').trim();
        const weight = String(s?.weight ?? '').trim();
        return reps !== '' || weight !== '';
      }),
    }))
    .filter((ae) => ae.name.trim() !== '' && ae.sets.length > 0);

  const todayLog = { log: cleanedLog, additionalExercises: cleanedAdditional };

  all[logDate] = {
    ...(all[logDate] || {}),
    [selectedDay]: todayLog,
  };

  await AsyncStorage.setItem('logs', JSON.stringify(all));
  Alert.alert('Saved', 'Workout saved!');

  // Refresh the list
  await loadLogsForDay();

 
  setIsEditing(true);     // go back to edit mode
  await loadLog();        

  requestAnimationFrame(() => {
    scrollRef?.current?.scrollTo({ y: 0, animated: true });
  });
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

      // give React a tick to render, then scroll
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      });
      // or: setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 0);
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

  const { selectedDays, dayTitles } = routine;

  return (
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
  style={{ flex: 1 }}
>
  <ScrollView
    ref={scrollRef}
    style={{flex:1}}
    contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled"
  >
        <Text style={styles.title}>Select a Day</Text>
        <View style={styles.daysContainer}>
          {(selectedDays || []).map((day) => (
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

           <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
         <Text style={styles.saveText}>Save Workout</Text>
        </TouchableOpacity>


            {logsForDay.length > 0 && (
              <>
                <Text style={styles.subtitle}>Previous Logs</Text>
                {logsForDay
                  .sort((a, b) => (a[0] < b[0] ? 1 : -1))
                  .map(([date, data], index) => {
                    const dayLog = data[selectedDay];
                    if (!dayLog) return null;

                    return (
                      <View key={index} style={styles.previousLogBlock}>
                        <Text style={styles.previousLogDate}>{date}</Text>

                        {Object.entries(dayLog.log).map(([ex, sets], i) => (
                          <View key={i} style={{ marginBottom: 4 }}>
                          <Text
                            style={styles.exerciseTitle}
                            onPress={() => navigation.navigate('ExerciseGraph', { exerciseName: ex })}
                          >
                            {ex}
                          </Text>


                                      {sets.map((s, idx) => (
                              <Text key={idx} style={styles.readOnlyText}>
                                Set {idx + 1}: {s.reps} reps × {s.weight} kg
                              </Text>
                            ))}
                          </View>
                        ))}

                      {dayLog.additionalExercises?.map((ae, i) => (
  <View key={`a-${i}`}>
    <Text style={styles.exerciseTitle}>
      {ae?.name ? `${ae.name} (Additional)` : '(Additional)'}
    </Text>
    {ae.sets?.map((set, idx) => (
      <Text key={idx} style={styles.readOnlyText}>
        Set {idx + 1}: {set.reps} reps × {set.weight} kg
      </Text>
    ))}
  </View>
))}


                        <View style={styles.previousLogButtons}>
                          <TouchableOpacity onPress={() => editLogEntry(date)}>
                            <Text style={[styles.editText, { marginRight: 10 }]}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteLogEntry(date)}>
                            <Text style={[styles.addText, { color: 'red' }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.separator} />
                      </View>
                    );
                  })}
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
// Menu blue '#3b82f6'
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
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
    backgroundColor: '#3b82f6',
  },
  daySelected: {
    backgroundColor: '#798597ff',
  },
  dayButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontWeight: '600',
    color: 'white',
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
    color: '#3b82f6',
    fontWeight: 'bold',
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editText:{
    color: '#3b82f6',
    fontWeight: 'bold',
    marginTop: 6,
  },
  readOnlyText: {
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#b6bbc4ff',
    marginTop: 10,
  },
  previousLogBlock: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#cfdef563',
    borderRadius: 6,
  },
  previousLogDate: {
    fontWeight: 'bold',
    color:'#003366',
    marginBottom: 6,
  },
  previousLogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
});
