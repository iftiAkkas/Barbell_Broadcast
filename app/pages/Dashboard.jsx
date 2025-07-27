import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { auth } from '../../firebase/config';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const [name, setName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || 'User');
    }
  }, []);

  const stepsToday = 7500;
  const stepsGoal = 10000;
  const caloriesBurned = 350;
  const activeMinutes = 45;
  const workoutCompleted = 2;
  const workoutGoal = 3;
  const motivationalQuote = "Push yourself, because no one else is going to do it for you.";

  const stepProgress = (stepsToday / stepsGoal) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.welcome}>🔥 Hey, {name}!</Text>
      <Text style={styles.subWelcome}>Let’s turn up the heat today! 💪</Text>

      {/* Circular Step Progress */}
      <View style={styles.circularContainer}>
        <AnimatedCircularProgress
          size={180}
          width={18}
          fill={stepProgress}
          tintColor="#ff6f00"
          backgroundColor="#ffe0b2"
          lineCap="round"
          duration={1000}
          rotation={0}
        >
          {() => (
            <View style={styles.circularText}>
              <Text style={styles.stepCount}>{stepsToday}</Text>
              <Text style={styles.stepLabel}>Steps</Text>
            </View>
          )}
        </AnimatedCircularProgress>
        <Text style={styles.goalText}>🎯 Goal: {stepsGoal} steps</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryBox}>
        <Text style={styles.sectionTitle}>🔥 Today's Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{caloriesBurned}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{activeMinutes}</Text>
            <Text style={styles.summaryLabel}>Active Mins</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {workoutCompleted}/{workoutGoal}
            </Text>
            <Text style={styles.summaryLabel}>Workouts</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.start]}>
          <Text style={styles.buttonText}>🔥 Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.log]}>
          <Text style={styles.buttonText}>📋 Log Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.water]}>
          <Text style={styles.buttonText}>💧 Log Water</Text>
        </TouchableOpacity>

      </View>

      {/* Motivation Quote */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{motivationalQuote}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff8e1',
    flex: 1,
    marginTop: 60,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: '#e65100',
  },
  subWelcome: {
    fontSize: 16,
    marginBottom: 20,
    color: '#ff7043',
  },
  circularContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  circularText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ff6f00',
  },
  stepLabel: {
    fontSize: 14,
    color: '#bf360c',
  },
  goalText: {
    marginTop: 10,
    color: '#e65100',
    fontWeight: '600',
  },
  summaryBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    shadowColor: '#ff6f00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#e64a19',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ff5722',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#bf360c',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginVertical: 8,
    flexBasis: '48%',
  },
  start: {
    backgroundColor: '#ff7043',
  },
  log: {
    backgroundColor: '#ffb300',
  },
  water: {
    backgroundColor: '#ff8a65',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 15,
  },
  quoteContainer: {
    backgroundColor: '#fffde7',
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#ffd54f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  quoteText: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#f57f17',
    textAlign: 'center',
  },
});
