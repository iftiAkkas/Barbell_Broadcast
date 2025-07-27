// Sets and Reps should display Range
// Couldn't fix, leaving it for later


import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView
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
        [day]: { title: '', exercises: [''], sets: [''], reps: [''] }
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
    finalRoutine.dayTitles[day] = dayData[day].title;

  const cleanExercises = dayData[day].exercises
  .map((ex, i) => ({
    ex: ex.trim(),
    sets: dayData[day].sets[i]?.toString().trim() || '0',
    reps: dayData[day].reps[i]?.toString().trim() || '0',
  }))
  .filter(item => item.ex !== '');

finalRoutine.dayTitles[day] = dayData[day].title;
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
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.container}>
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

          {selectedDays.map(day => (
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

              {dayData[day].exercises.map((_, idx) => (
  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        // keyboardType="numeric"
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
          ))}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.btnText}>Save Routine</Text>
          </TouchableOpacity>
        </>
      )}

      {routine && !creating && (
  <>
    <Text style={styles.title}>Saved Routine: {routine.title}</Text>
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
    sets: routine.sets?.[day] || [],    
    reps: routine.reps?.[day] || [],    
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
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginVertical: 6,
    backgroundColor: '#fff',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  dayBlock: { marginVertical: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 6 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  dayBtn: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  selected: { backgroundColor: '#a0e1e5' },
  addMore: { color: '#007bff', marginTop: 6 },
  createBtn: {
    backgroundColor: '#07c5ffff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  editBtn: {
    backgroundColor: '#07c5ffff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  exerciseLine: { marginTop: 4 },

  deleteBtnSmall: {
  marginLeft: 10,
  backgroundColor: '#dc3545',
  padding: 8,
  borderRadius: 5,
},
deleteText: {
  color: '#fff',
  fontWeight: 'bold',
},

});
