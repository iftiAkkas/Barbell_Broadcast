//Clicking on other dots should show the sets of those days

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Strength score formula
function calculateStrengthScore(weight, reps) {
  return weight * Math.pow(1 + reps / 40, 1.1);
}

export default function ExerciseGraphScreen({ route }) {
  const { exerciseName } = route.params;
  const [dataPoints, setDataPoints] = useState([]); // [{date, score, sets:[{weight,reps,score}]}]
  const [tooltip, setTooltip] = useState(null);      // { x, y, text }
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      const stored = await AsyncStorage.getItem('logs');
      const all = stored ? JSON.parse(stored) : {};

      // Build per-day aggregation of ALL sets for this exercise
      const perDay = {}; // date -> [{weight,reps,score}, ...]

      Object.entries(all).forEach(([date, dayData]) => {
        Object.values(dayData).forEach((entry) => {
          // Routine exercises (array of sets)
          const routineSets = entry.log?.[exerciseName] || [];
          routineSets.forEach(({ reps, weight }) => {
            const repsNum = parseFloat(reps);
            const weightNum = parseFloat(weight);
            if (!isNaN(repsNum) && !isNaN(weightNum)) {
              const sc = calculateStrengthScore(weightNum, repsNum);
              (perDay[date] ||= []).push({
                reps: repsNum,
                weight: weightNum,
                score: sc,
              });
            }
          });

          // Additional exercises (could be multiple entries for same name)
          entry.additionalExercises?.forEach((ae) => {
            if (ae.name === exerciseName) {
              ae.sets.forEach(({ reps, weight }) => {
                const repsNum = parseFloat(reps);
                const weightNum = parseFloat(weight);
                if (!isNaN(repsNum) && !isNaN(weightNum)) {
                  const sc = calculateStrengthScore(weightNum, repsNum);
                  (perDay[date] ||= []).push({
                    reps: repsNum,
                    weight: weightNum,
                    score: sc,
                  });
                }
              });
            }
          });
        });
      });

      // Turn into sorted array of days; day score = max set score
      const points = Object.entries(perDay)
        .map(([date, sets]) => {
          const maxSet = sets.reduce((m, s) => (s.score > m.score ? s : m), sets[0]);
          return {
            date,
            score: Math.round(maxSet.score),
            sets: sets
              .slice()
              .sort((a, b) => b.score - a.score) // show best-first
              .map(s => ({ ...s, score: Math.round(s.score) })),
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setDataPoints(points);
    };

    loadLogs();
  }, [exerciseName]);

  // Default select the peak day when data changes
  useEffect(() => {
    if (!dataPoints.length) {
      setSelectedIndex(null);
      return;
    }
    let maxIdx = 0;
    for (let i = 1; i < dataPoints.length; i++) {
      if (dataPoints[i].score > dataPoints[maxIdx].score) maxIdx = i;
    }
    setSelectedIndex(maxIdx);
  }, [dataPoints]);

  const rawLabels = dataPoints.map((pt) => pt.date.slice(5)); // MM-DD
  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
  const labels = rawLabels.map((d, i) => (i % step === 0 ? d : ''));

  const scores = dataPoints.map((pt) => pt.score);

  const chartData = {
    labels,
    datasets: [
      {
        data: scores,
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 3,
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke:  'rgba(16, 80, 200, 1)',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3 6',
      stroke: 'rgba(0,0,0,0.08)',
      strokeWidth: 1,
    },
    useShadowColorFromDataset: false,
    fillShadowGradient:  'rgba(16, 80, 200, 1)',
    fillShadowGradientOpacity: 0.15,
    formatYLabel: () => '',
  };

  // Peak index for highlighting
  const peakIndex = useMemo(() => {
    if (!dataPoints.length) return null;
    let m = 0;
    for (let i = 1; i < dataPoints.length; i++) {
      if (dataPoints[i].score > dataPoints[m].score) m = i;
    }
    return m;
  }, [dataPoints]);

  const dynamicWidth = Math.max(screenWidth, dataPoints.length * 36);

  const selectedPoint = useMemo(() => {
    if (selectedIndex == null || !dataPoints[selectedIndex]) return null;
    return dataPoints[selectedIndex];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, dataPoints]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Progress for: {exerciseName}</Text>

      {dataPoints.length > 0 ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartCard}>
              <LineChart
                data={chartData}
                width={dynamicWidth}
                height={260}
                chartConfig={chartConfig}
                withDots
                withInnerLines
                withOuterLines={false}
                withVerticalLabels={true}    // show X-axis dates
                withHorizontalLabels={true}  // hide Y-axis numbers
                bezier={false}
                fromZero
                segments={4}
                style={styles.chart}
                onDataPointClick={({ index, x, y, value }) => {
                  // reliably switch details to tapped day
                  setSelectedIndex(index);

                  // Optional tooltip
                  const p = dataPoints[index];
                  if (p) {
                    const text = `${p.date}\nScore: ${value}\n${
                      p.sets[0]?.weight ?? '-'
                    } kg × ${p.sets[0]?.reps ?? '-'}`;
                    setTooltip({ x, y, text });
                    setTimeout(() => setTooltip(null), 1200);
                  }
                }}
                // 1) Peak-day highlight ring
              renderDotContent={({ x, y, index }) =>
              peakIndex === index ? (
                <View
                  key={`peak-${index}`}
                  style={{
                    position: 'absolute',
                    top: y - 6,     // adjust center
                    left: x - 6,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderWidth: 4, 
                    borderColor: 'rgba(34,197,94,0.95)',
                    backgroundColor: '#ffffff',
                  }}
                />
              ) : null
            }

              />

              {/* Tooltip bubble (optional) */}
              {tooltip && (
                <View style={[styles.tooltip, { left: tooltip.x - 48, top: tooltip.y - 56 }]}>
                  <Text style={styles.tooltipText}>{tooltip.text}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* 2) Details panel: shows ALL sets for selected day */}
          {selectedPoint && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>
                {selectedIndex === peakIndex ? 'Peak Day' : 'Selected Day'}
              </Text>
              <Text style={styles.detailLine}>
                Date: <Text style={styles.detailStrong}>{selectedPoint.date}</Text>
              </Text>
              <Text style={styles.detailLine}>
                Score (best set): <Text style={styles.detailStrong}>{selectedPoint.score}</Text>
              </Text>

              <Text style={[styles.detailLine, { marginTop: 8, fontWeight: '800' }]}>
                All Sets
              </Text>
              {selectedPoint.sets.map((s, i) => (
                <Text key={i} style={styles.setLine}>
                  • {s.weight} kg × {s.reps}  <Text style={styles.setScore}>({s.score})</Text>
                </Text>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noData}>No logs available for this exercise yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    color: '#003366',
  },
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
    marginVertical: 8,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: 160,
  },
  tooltipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  detailCard: {
    marginTop: 12,
    width: screenWidth - 32,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  detailLine: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 2,
  },
  detailStrong: {
    fontWeight: '800',
    color: '#0f172a',
  },
  setLine: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 2,
  },
  setScore: {
    color: '#64748b',
    fontWeight: '700',
  },

  noData: {
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
});
