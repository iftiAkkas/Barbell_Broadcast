import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';


export default function TrackerListScreen() {
  const [trackers, setTrackers] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [goal, setGoal] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const navigation = useNavigation();


  
useFocusEffect(
  React.useCallback(() => {
    loadTrackers();
  }, [])
);

  useEffect(() => {
    loadTrackers();
  }, []);

  const loadTrackers = async () => {
    try {
      const data = await AsyncStorage.getItem('customTrackers');
      if (data) setTrackers(JSON.parse(data));
    } catch (err) {
      console.error('Failed to load trackers:', err);
    }
  };

  const saveTrackers = async (updated) => {
    try {
      await AsyncStorage.setItem('customTrackers', JSON.stringify(updated));
      setTrackers(updated);
    } catch (err) {
      console.error('Failed to save trackers:', err);
    }
  };

  const handleAddOrEdit = () => {
    if (!name.trim()) return;

    const updated = [...trackers];
    const newTracker = { name: name.trim(), unit, goal };

    if (editingIndex !== null) {
      updated[editingIndex] = newTracker;
    } else {
      updated.push(newTracker);
    }

    saveTrackers(updated);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setUnit('');
    setGoal('');
    setEditingIndex(null);
    setFormVisible(false);
  };

  const handleEdit = (tracker, index) => {
    setName(tracker.name);
    setUnit(tracker.unit || '');
    setGoal(tracker.goal || '');
    setEditingIndex(index);
    setFormVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Trackers</Text>

      {trackers.map((tracker, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.trackerItem}
        onPress={() =>
  navigation.navigate('CustomTracker', {
    trackerKey: tracker.name.toLowerCase().replace(/\s+/g, '_'),
    title: tracker.name,
    goal: tracker.goal,
    unit: tracker.unit,
  })
}

        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.trackerName}>{tracker.name}</Text>
              {tracker.goal && (
                <Text style={styles.goalLine}>Goal: {tracker.goal} {tracker.unit}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => handleEdit(tracker, idx)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {!formVisible && (
        <TouchableOpacity style={styles.addNewBtn} onPress={() => setFormVisible(true)}>
          <Text style={styles.addNewText}>+ Add New Tracker</Text>
        </TouchableOpacity>
      )}

      {formVisible && (
        <View style={styles.formContainer}>
          <Text style={styles.formHeader}>{editingIndex !== null ? 'Edit Tracker' : 'Add New Tracker'}</Text>

          <TextInput
            placeholder="Tracker Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Unit (e.g. kg, ml)"
            value={unit}
            onChangeText={setUnit}
            style={styles.input}
          />
          <TextInput
            placeholder="Goal (optional)"
            value={goal}
            onChangeText={setGoal}
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddOrEdit}>
              <Text style={styles.btnText}>{editingIndex !== null ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {color: '#023b96ff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  trackerItem: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    marginVertical: 6,
  },
  trackerName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  goalLine: { color: '#ffffffff', marginTop: 4 },
  editText: { color: '#ffffffff', fontWeight: '600' },
  addNewBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  addNewText: { color: '#fff', fontWeight: 'bold' },
  formContainer: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
  },
  formHeader: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginVertical: 6,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#ffffffff',
    padding: 10,
    marginRight: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#b8bfe5ff',
    padding: 10,
    marginLeft: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color:'#3b82f6', fontWeight: 'bold' },
});
