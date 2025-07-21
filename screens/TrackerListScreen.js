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

export default function TrackerListScreen() {
  const [trackers, setTrackers] = useState([]);
  const [newTrackerName, setNewTrackerName] = useState('');
  const [newTrackerUnit, setNewTrackerUnit] = useState('');
  const [newTrackerGoal, setNewTrackerGoal] = useState('');
  const navigation = useNavigation();

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

  const addTracker = () => {
    if (newTrackerName.trim() === '') return;
    const newTracker = {
      name: newTrackerName.trim(),
      unit: newTrackerUnit.trim(),
      goal: newTrackerGoal.trim(),
    };
    const updated = [...trackers, newTracker];
    saveTrackers(updated);
    setNewTrackerName('');
    setNewTrackerUnit('');
    setNewTrackerGoal('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Trackers</Text>

      {trackers.map((tracker, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.trackerItem}
          onPress={() => navigation.navigate('CustomTracker', { name: tracker.name })}
        >
          <Text style={styles.trackerText}>{tracker.name}</Text>
          {tracker.unit ? <Text style={styles.trackerSubText}>Unit: {tracker.unit}</Text> : null}
          {tracker.goal ? <Text style={styles.trackerSubText}>Goal: {tracker.goal}</Text> : null}
        </TouchableOpacity>
      ))}

      <View style={styles.addContainer}>
        <TextInput
          placeholder="Tracker Name"
          value={newTrackerName}
          onChangeText={setNewTrackerName}
          style={styles.input}
        />
        <TextInput
          placeholder="Unit (e.g., kg, L)"
          value={newTrackerUnit}
          onChangeText={setNewTrackerUnit}
          style={styles.input}
        />
        <TextInput
          placeholder="Goal (optional)"
          value={newTrackerGoal}
          onChangeText={setNewTrackerGoal}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTracker}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  trackerItem: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    marginVertical: 6,
  },
  trackerText: { fontSize: 16, fontWeight: 'bold' },
  trackerSubText: { fontSize: 14, color: '#555' },
  addContainer: { marginTop: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  addText: { color: '#fff', fontWeight: 'bold' },
});
