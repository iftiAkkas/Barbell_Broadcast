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

// --- Firebase ---
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import app from '../../firebase/config';

const screenWidth = Dimensions.get('window').width;

export default function CustomTrackerScreen({ route }) {
  const { trackerKey, title } = route.params;
  const [value, setValue] = useState('');
  const [logs, setLogs] = useState({});
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Tooltip state
  const [tooltip, setTooltip] = useState(null); // { x, y, value }

  const dateStr = date.toISOString().split('T')[0];
  const navigation = useNavigation();

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const stored = await AsyncStorage.getItem(`tracker_${trackerKey}`);
        if (stored) setLogs(JSON.parse(stored));

        // 🔹 Fetch from Firestore as well
        const user = auth.currentUser;
        if (user) {
          const trackerRef = doc(db, 'users', user.uid, 'trackers', trackerKey);
          const snap = await getDoc(trackerRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.logs) {
              setLogs(data.logs);
              await AsyncStorage.setItem(`tracker_${trackerKey}`, JSON.stringify(data.logs));
            }
          }
        }
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
      // 🔹 Save locally
      await AsyncStorage.setItem(`tracker_${trackerKey}`, JSON.stringify(updated));
      setLogs(updated);
      setValue('');

      // 🔹 Save to Firestore
      const user = auth.currentUser;
      if (user) {
        const trackerRef = doc(db, 'users', user.uid, 'trackers', trackerKey);
        await setDoc(trackerRef, { title, logs: updated }, { merge: true });
      }

      Alert.alert('Saved!', `Entry for ${dateStr} saved.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save log.');
    }
  };

  const deleteLog = async (key) => {
    const updated = { ...logs };
    delete updated[key];

    try {
      // 🔹 Update local
      await AsyncStorage.setItem(`tracker_${trackerKey}`, JSON.stringify(updated));
      setLogs(updated);

      // 🔹 Update Firestore
      const user = auth.currentUser;
      if (user) {
        const trackerRef = doc(db, 'users', user.uid, 'trackers', trackerKey);
        await updateDoc(trackerRef, {
          [`logs.${key}`]: deleteField(),
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to delete log.');
    }
  };

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
              // 🔹 Remove local
              await AsyncStorage.removeItem(`tracker_${trackerKey}`);

              const stored = await AsyncStorage.getItem('customTrackers');
              if (stored) {
                const parsed = JSON.parse(stored);
                const updated = parsed.filter(t => t.name !== title);
                await AsyncStorage.setItem('customTrackers', JSON.stringify(updated));
              }

              // 🔹 Remove from Firestore
              const user = auth.currentUser;
              if (user) {
                const trackerRef = doc(db, 'users', user.uid, 'trackers', trackerKey);
                await setDoc(trackerRef, {}, { merge: false }); // effectively deletes doc
              }

              Alert.alert('Deleted', `"${title}" tracker deleted.`);
              navigation.goBack();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Could not delete tracker.');
            }
          }
        }
      ]
    );
  };

  // Process chart
  const sortedEntries = Object.entries(logs).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  const rawLabels = sortedEntries.map(([date]) => date.slice(5)); // MM-DD
  const graphData = sortedEntries.map(([_, val]) => Number(val));
  const maxLabels = 6;
  const labelEvery = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
  const graphLabels = rawLabels.map((d, i) => (i % labelEvery === 0 ? d : ''));

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 80, 200, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
    strokeWidth: 3,
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: 'rgba(16, 80, 200, 1)',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3 6',
      stroke: 'rgba(0,0,0,0.08)',
    },
    fillShadowGradient: 'rgba(16, 80, 200, 1)',
    fillShadowGradientOpacity: 0.15,
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
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
          <Text style={styles.subtitle}>Progress</Text>
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: graphLabels,
                datasets: [{ data: graphData }],
              }}
              width={screenWidth - 32}
              height={260}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>
        </>
      )}

      <Text style={styles.subtitle}>Previous Logs</Text>
      {sortedEntries.reverse().map(([d, v], i) => (
        <View key={i} style={styles.logItem}>
          <Text style={styles.logText}>
            <Text style={styles.logDate}>{d}</Text> · {v}
          </Text>
          <TouchableOpacity onPress={() => deleteLog(d)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={deleteTracker} style={styles.deleteTrackerBtn}>
        <Text style={styles.deleteTrackerText}>Delete Tracker</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 30, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6, color: '#002b70ff' },
  date: { fontSize: 16, marginBottom: 14, color: '#3b82f6', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  saveText: { color: '#fff', fontWeight: '800' },
  subtitle: { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    elevation: 3,
    marginBottom: 20,
  },
  chart: { borderRadius: 16, marginVertical: 10 },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  logText: { color: '#fff' },
  logDate: { fontWeight: '700' },
  deleteText: { color: '#fff', fontWeight: '700' },
  deleteTrackerBtn: {
    marginTop: 28,
    padding: 14,
    backgroundColor: '#ca2b2b',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteTrackerText: { color: '#fff', fontWeight: '800' },
});
