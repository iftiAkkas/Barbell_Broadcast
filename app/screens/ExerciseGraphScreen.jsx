// ExerciseGraphScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

function calculateStrengthScore(weight, reps) {
  return weight * Math.pow(1 + reps / 40, 1.1);
}

export default function ExerciseGraphScreen({ route }) {
  const { selectedDay, exerciseName } = route.params;
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const stored = await AsyncStorage.getItem('logs');
      const all = stored ? JSON.parse(stored) : {};

      const points = Object.entries(all)
        .filter(([_, val]) => val[selectedDay])
        .map(([date, val]) => {
          const log = val[selectedDay]?.log?.[exerciseName];
          if (log && log.length > 0) {
            const { reps, weight } = log[0]; // first set only
            const score = calculateStrengthScore(parseFloat(weight), parseFloat(reps));
            return { date, score: Math.round(score) };
          }
          return null;
        })
        .filter((point) => point !== null)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setDataPoints(points);
    };

    loadLogs();
  }, [selectedDay, exerciseName]);

  const chartData = {
    labels: dataPoints.map((pt) => pt.date.slice(5)),
    datasets: [
      {
        data: dataPoints.map((pt) => pt.score),
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
  backgroundGradientFrom: '#f2f2f2',
  backgroundGradientTo: '#f2f2f2',
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 3,
  decimalPlaces: 0,
  propsForDots: {
    r: '3',
    strokeWidth: '2',
    stroke: '#007bff',
  },
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Progress for: {exerciseName}</Text>
      {dataPoints.length > 0 ? (
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={250}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
         
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No logs available for this exercise yet.</Text>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#f5f5f5',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#007bff',
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
