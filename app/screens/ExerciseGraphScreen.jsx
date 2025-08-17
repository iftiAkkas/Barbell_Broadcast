import React, { useEffect, useState } from 'react';
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
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const stored = await AsyncStorage.getItem('logs');
      const all = stored ? JSON.parse(stored) : {};

      const points = [];

      Object.entries(all).forEach(([date, dayData]) => {
        Object.values(dayData).forEach((entry) => {
          // Routine exercises
     const sets = entry.log?.[exerciseName];
        if (sets && sets.length > 0) {
          const { reps, weight } = sets[0]; // use first set

          const repsNum = parseFloat(reps);
          const weightNum = parseFloat(weight);

          if (!isNaN(repsNum) && !isNaN(weightNum)) {
            const score = calculateStrengthScore(weightNum, repsNum);
            points.push({ date, score: Math.round(score) });
          }
}


          // Additional exercises
     entry.additionalExercises?.forEach((ae) => {
  if (ae.name === exerciseName && ae.sets.length > 0) {
    const { reps, weight } = ae.sets[0];

    const repsNum = parseFloat(reps);
    const weightNum = parseFloat(weight);

    if (!isNaN(repsNum) && !isNaN(weightNum)) {
      const score = calculateStrengthScore(weightNum, repsNum);
      points.push({ date, score: Math.round(score) });
    }
  }
});

        });
      });

      points.sort((a, b) => new Date(a.date) - new Date(b.date));
      setDataPoints(points);
    };

    loadLogs();
  }, [exerciseName]);

const chartData = {
  labels: dataPoints.map((pt) => pt.date.slice(5).replace('-', '/')), // MM/DD
  datasets: [
    {
      data: dataPoints.map((pt) => pt.score),
      strokeWidth: 2,
    },
  ],
};


const chartConfig = {
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#f5f5f5',
  decimalPlaces: 0,
  color: () => '#007bff',
  labelColor: () => '#000',
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#007bff',
  },
  formatYLabel: () => '', // ❌ Hide Y-axis labels
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Progress for: {exerciseName}</Text>
      {dataPoints.length > 0 ? (
     <LineChart
  data={chartData}
  width={screenWidth - 32}
  height={250}
  chartConfig={chartConfig}
  bezier
  withVerticalLabels={false}     // ❌ Hides Y-axis labels
  withHorizontalLabels={true}    // ✅ Keeps X-axis labels (dates)
  withDots
  withShadow
  style={styles.chart}
/>

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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#003366',
  },
  chart: {
    borderRadius: 12,
  },
  noData: {
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
});
