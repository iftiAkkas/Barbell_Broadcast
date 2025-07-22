// ADD A GOAL HORIZONTAL LINE LATER

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function CustomTrackerScreen({ route }) {
  const { trackerKey, title } = route.params;
  const [value, setValue] = useState('');
  const [logs, setLogs] = useState({});
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const dateStr = date.toISOString().split('T')[0];

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const stored = await AsyncStorage.getItem(`tracker_${trackerKey}`);
        if (stored) setLogs(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load logs', e);
      }
    };
    loadLogs();
  }, []);

  const saveLog = async () => {
    if (!value.trim()) return;

    const updated = { ...logs, [dateStr]: parseFloat(value) };

    try {
      await AsyncStorage.setItem(`tracker_${trackerKey}`, JSON.stringify(updated));
      setLogs(updated);
      setValue('');
      Alert.alert('Saved!', `Entry for ${dateStr} saved.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save log.');
    }
  };

  const deleteLog = async (key) => {
    const updated = { ...logs };
    delete updated[key];
    try {
      await AsyncStorage.setItem(`tracker_${trackerKey}`, JSON.stringify(updated));
      setLogs(updated);
    } catch (e) {
      Alert.alert('Error', 'Failed to delete log.');
    }
  };

  const sortedEntries = Object.entries(logs).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  const graphLabels = sortedEntries.map(([date]) => date.slice(5)); // MM-DD
  const graphData = sortedEntries.map(([_, val]) => Number(val));



    const navigation = useNavigation();
const deleteTracker = async () => {
  Alert.alert(
    'Confirm Deletion',
    `Delete tracker "${title}" and all data?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Delete this tracker's log data
            await AsyncStorage.removeItem(`tracker_${trackerKey}`);

            // Delete from customTrackers list
            const stored = await AsyncStorage.getItem('customTrackers');
            if (stored) {
              const parsed = JSON.parse(stored);
              const updated = parsed.filter(t => t.name !== title); // Remove from list
              await AsyncStorage.setItem('customTrackers', JSON.stringify(updated));
            }

            Alert.alert('Deleted', `"${title}" tracker deleted.`);
            navigation.goBack(); // return to tracker list
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not delete tracker.');
          }
        }
      }
    ]
  );
};











  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text style={styles.date}>{dateStr} 📅</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, selected) => {
            setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter value"
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
        <Text style={styles.saveText}>Save Entry</Text>
      </TouchableOpacity>

      {graphData.length > 0 && (
        <>
          <Text style={styles.subtitle}>Progress Graph</Text>
          <LineChart
            data={{
              labels: graphLabels,
              datasets: [{ data: graphData }]
            }}
            width={screenWidth - 32}
            height={220}
            yAxisSuffix=""
            chartConfig={{
              backgroundGradientFrom: "#f2f2f2",
              backgroundGradientTo: "#e2e2e2",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              strokeWidth: 2,
            }}
            style={{ borderRadius: 10, marginVertical: 10 }}
          />
        </>
      )}

      <Text style={styles.subtitle}>Previous Logs</Text>
      {sortedEntries
        .reverse()
        .map(([d, v], i) => (
          <View key={i} style={styles.logItem}>
            <Text>{d}: {v}</Text>
            <TouchableOpacity onPress={() => deleteLog(d)}>
              <Text style={styles.deleteText}>❌</Text>
            </TouchableOpacity>
          </View>
        ))}


        <TouchableOpacity
  onPress={deleteTracker}
  style={{ marginTop: 30, padding: 12, backgroundColor: '#dc3545', borderRadius: 6 }}
>
  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
    Delete Tracker
  </Text>
</TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  date: { fontSize: 16, marginBottom: 10, color: '#007bff' },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  deleteText: { color: '#dc3545', fontWeight: 'bold' },
});
