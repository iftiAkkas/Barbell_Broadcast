import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExerciseDetailsScreen() {
  const item = useLocalSearchParams();

  const instructions = (() => {
    try {
      const parsed = JSON.parse(item.instructions);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return item.instructions ? [item.instructions] : [];
    }
  })();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{capitalize(item.name)}</Text>
        <Text style={styles.subtext}>{capitalize(item.bodyPart)} | {capitalize(item.equipment)} | {capitalize(item.difficulty)}</Text>

        <View style={styles.tags}>
          <Text style={styles.tag}>Target: {capitalize(item.target)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📝 Description</Text>
        <Text style={styles.sectionText}>{item.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📌 Instructions</Text>
        {instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
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
    backgroundColor: '#fefefe',
  },
  headerContainer: {
    backgroundColor: '#fcd34d',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 35,
    paddingHorizontal: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
  },
  tags: {
    marginTop: 5,
  },
  tag: {
    backgroundColor: '#fbbf24',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumber: {
    fontWeight: '700',
    fontSize: 15,
    marginRight: 8,
    color: '#ef4444',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
});
