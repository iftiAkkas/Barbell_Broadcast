import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebase/config';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const [name, setName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || 'User');
    }
  }, []);
  // Sample data (replace with real data from your app state)
  const stepsToday = 7500;
  const stepsGoal = 10000;
  const caloriesBurned = 350;
  const activeMinutes = 45;
  const workoutCompleted = 2;
  const workoutGoal = 3;
  const motivationalQuote = "Push yourself, because no one else is going to do it for you.";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome */}
      <Text style={styles.welcome}>Hi, {name}! 👋</Text>
      <Text style={styles.subWelcome}>Ready to start your workout?</Text>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{stepsToday}</Text>
            <Text style={styles.summaryLabel}>Steps</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{caloriesBurned}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{activeMinutes}</Text>
            <Text style={styles.summaryLabel}>Active Mins</Text>
          </View>
        </View>
        <Text style={styles.workoutProgress}>
          Workout: {workoutCompleted} / {workoutGoal}
        </Text>
      </View>

      {/* Quick Start Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Log Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Log Water</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Step Goal Progress</Text>
        <ProgressBar progress={stepsToday / stepsGoal} />
        <Text style={styles.progressText}>{stepsToday} / {stepsGoal} steps</Text>
      </View>

      {/* Motivation */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{motivationalQuote}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdfdfd',
    flex: 1,
    marginTop: 60,
  },
  contentContainer: {
    padding: 20,
  },
  welcome: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  subWelcome: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  summaryBox: {
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#00796b',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00796b',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#004d40',
  },
  workoutProgress: {
    fontSize: 15,
    fontWeight: '500',
    color: '#004d40',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#00796b',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginVertical: 6,
    flexBasis: '48%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    color: '#00796b',
  },
  quoteContainer: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
  },
  quoteText: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#bf360c',
    textAlign: 'center',
  },
});
