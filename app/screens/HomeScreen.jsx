import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const BUTTON_SIZE = (screenWidth - 60) / 2;

export default function HomeScreen() {
  const navigation = useNavigation();

  const buttons = [
    {
      label: 'Workout Log',
      icon: 'https://cdn-icons-png.flaticon.com/128/4721/4721130.png',
      screen: 'ExerciseLog',
      colors: ['#FF6F61', '#D72631'],
    },
    {
      label: 'Routine',
      icon: 'https://cdn-icons-png.flaticon.com/128/3476/3476097.png',
      screen: 'Routine',
      colors: ['#F9D423', '#FF4E50'],
    },
    {
      label: 'Trackers',
      icon: 'https://cdn-icons-png.flaticon.com/128/2083/2083582.png',
      screen: 'TrackerList',
      colors: ['#FFA17F', '#00223E'],
    },
    {
      label: 'Personal Info',
      icon: 'https://cdn-icons-png.flaticon.com/128/4117/4117081.png',
      screen: 'PersonalInfo',
      colors: ['#FDC830', '#F37335'],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>🏋️ Fitness App</Text>

      <LinearGradient
        colors={['#8B0000', '#B22222', '#A0522D']} // darker gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dashboardWrapper}
      >
        <Text style={styles.dashboardText}>DASHBOARD</Text>
      </LinearGradient>

      <View style={styles.gridContainer}>
        {buttons.map(({ label, icon, screen, colors }) => (
          <TouchableOpacity
            key={label}
            style={styles.gridButtonWrapper}
            onPress={() => navigation.navigate(screen)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gridButton}
            >
              <Image source={{ uri: icon }} style={styles.icon} resizeMode="contain" />
              <Text style={styles.buttonLabel}>{label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    textAlign: 'center',
  },
  dashboardWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginBottom: 40,
    marginTop: 8,
  },
  dashboardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 30, // More spacing above buttons
  },
  gridButtonWrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  gridButton: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,

    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    // Shadow (Android)
    elevation: 10,
  },
  icon: {
    width: BUTTON_SIZE * 0.5,
    height: BUTTON_SIZE * 0.5,
    marginBottom: 12,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
});
