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

  // Tooltip state
  const [tooltip, setTooltip] = useState(null); // { x, y, value }

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


  const chartData = {
  labels: graphLabels,
  datasets: [
    {
      data: graphData,
      color: (opacity = 1) => `rgba(16, 80, 200, ${opacity})`,
      strokeWidth: 3,
    },
    // Invisible bounds to force [newMin, newMax]
    {
      data: [newMin, newMax],
      color: () => 'rgba(0,0,0,0)',
      strokeWidth: 0,
      withDots: false,
    },
  ],
};


  const sortedEntries = Object.entries(logs).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  const rawLabels = sortedEntries.map(([date]) => date.slice(5)); // MM-DD
  const graphData = sortedEntries.map(([_, val]) => Number(val));

  // Keep labels clean: show ~6 evenly distributed labels max
  const maxLabels = 6;
  const labelEvery = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
  const graphLabels = rawLabels.map((d, i) => (i % labelEvery === 0 ? d : ''));

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
              await AsyncStorage.removeItem(`tracker_${trackerKey}`);

              const stored = await AsyncStorage.getItem('customTrackers');
              if (stored) {
                const parsed = JSON.parse(stored);
                const updated = parsed.filter(t => t.name !== title);
                await AsyncStorage.setItem('customTrackers', JSON.stringify(updated));
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

  // ---- Aesthetic chart config ----
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 80, 200, ${opacity})`, // primary line
    labelColor: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
    strokeWidth: 3,
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: 'rgba(16, 80, 200, 1)',
    },
    // Softer grid
    propsForBackgroundLines: {
      strokeDasharray: '3 6',
      stroke: 'rgba(0,0,0,0.08)',
    },
    // Soft area under line
    useShadowColorFromDataset: false,
    fillShadowGradient: 'rgba(16, 80, 200, 1)',
    fillShadowGradientOpacity: 0.15,
  };

  const goal = null; // e.g., 70

// Integer-tick Y axis
const desiredSegments = 5; // try 4–6 if you prefer
const rawMin = graphData.length ? Math.min(...graphData) : 0;
const rawMax = graphData.length ? Math.max(...graphData) : 0;

const span = Math.max(0, rawMax - rawMin);
const step = Math.max(1, Math.ceil(span / desiredSegments)); // integer step >= 1
const newMin = Math.floor(rawMin / step) * step;
const newMax = Math.ceil(rawMax / step) * step;
const segments = Math.max(1, Math.round((newMax - newMin) / step));


  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
                datasets: [
                  {
                    data: graphData,
                    color: (opacity = 1) => `rgba(16, 80, 200, ${opacity})`, // line
                    strokeWidth: 3,
                  },
                ],
              }}
              width={screenWidth - 32}
              height={260}
              fromZero={false}
              yAxisSuffix=""
              yAxisInterval={1}
              segments={4}
              chartConfig={chartConfig}
              style={styles.chart}
              withDots
              withInnerLines
              withOuterLines={false}
              withVerticalLabels
              withHorizontalLabels
              // Keep lines straight (no bezier) for a crisp analytics vibe
              // bezier
              onDataPointClick={(dp) => {
                setTooltip({
                  x: dp.x,
                  y: dp.y,
                  value: dp.value,
                });
                // Auto-hide after a moment
                setTimeout(() => setTooltip(null), 1800);
              }}
              decorator={() => {
                // Draw goal line (if set)
                if (!goal || !graphData.length) return null;

                // Map goal value to chart Y coordinate
                const paddingTop = 16; // internal to chart-kit, approximate
                const paddingRight = 0;
                const chartHeight = 260;
                const usableHeight = chartHeight - paddingTop - 32; // ~bottom label area

                const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
                const yPos =
                  paddingTop + usableHeight * (1 - (goal - yMin) / (yMax - yMin));
                const yClamped = clamp(yPos, paddingTop, paddingTop + usableHeight);

                return (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: paddingRight,
                      top: yClamped,
                      height: 0,
                      borderTopWidth: 2,
                      borderTopColor: 'rgba(34, 197, 94, 0.9)', // green accent
                    }}
                  />
                );
              }}
            />

            {/* Tooltip */}
            {tooltip && (
              <View
                style={[
                  styles.tooltip,
                  { left: tooltip.x - 28, top: tooltip.y - 40 },
                ]}
              >
                <Text style={styles.tooltipText}>{tooltip.value}</Text>
              </View>
            )}
          </View>
        </>
      )}

      <Text style={styles.subtitle}>Previous Logs</Text>
      {sortedEntries
        .slice() // don’t mutate original
        .reverse()
        .map(([d, v], i) => (
          <View key={i} style={styles.logItem}>
            <Text style={styles.logText}>
              <Text style={styles.logDate}>{d}</Text>  ·  {v}
            </Text>
            <TouchableOpacity onPress={() => deleteLog(d)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

      <TouchableOpacity
        onPress={deleteTracker}
        style={styles.deleteTrackerBtn}
      >
        <Text style={styles.deleteTrackerText}>Delete Tracker</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6, color: '#0f172a' },
  date: { fontSize: 16, marginBottom: 14, color: '#1d4ed8', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#22c55e',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  saveText: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 8, color: '#0f172a' },

  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 10,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tooltipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logText: { color: '#0f172a', fontSize: 14 },
  logDate: { fontWeight: '700' },
  deleteText: { color: '#dc2626', fontWeight: '700' },

  deleteTrackerBtn: {
    marginTop: 28,
    padding: 14,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteTrackerText: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },
});
