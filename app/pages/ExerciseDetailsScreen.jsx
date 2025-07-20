import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExerciseDetailsScreen() {
  const item = useLocalSearchParams();

  // Safely parse instructions
  const instructions = (() => {
    try {
      const parsed = JSON.parse(item.instructions);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return item.instructions ? [item.instructions] : [];
    }
  })();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{capitalize(item.name)}</Text>

        <Text style={styles.label}>
          Body Part: <Text style={styles.value}>{capitalize(item.bodyPart)}</Text>
        </Text>
        <Text style={styles.label}>
          Equipment: <Text style={styles.value}>{capitalize(item.equipment)}</Text>
        </Text>
        <Text style={styles.label}>
          Target: <Text style={styles.value}>{capitalize(item.target)}</Text>
        </Text>
        <Text style={styles.label}>
          Difficulty: <Text style={styles.value}>{capitalize(item.difficulty)}</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {instructions.map((step, index) => (
          <View key={index} style={styles.instructionStep}>
            <Text style={styles.stepNumber}>{index + 1}.</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    backgroundColor: '#e5e5e5',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 30,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepNumber: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1f2937',
    marginRight: 6,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
}); 