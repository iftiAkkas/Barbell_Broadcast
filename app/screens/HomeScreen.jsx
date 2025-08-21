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

const screenWidth = Dimensions.get('window').width;
const BUTTON_SIZE = (screenWidth - 60) / 2;

export default function HomeScreen() {
  const navigation = useNavigation();

  const buttons = [
    {
      label: 'Workout Log',
      icon: require('../../assets/w2.png'),
      screen: 'ExerciseLog',
    },
    {
      label: 'Routine',
      icon: require('../../assets/exercise-routine.png'),
      screen: 'Routine',
    },
    {
      label: 'Trackers',
      icon: require('../../assets/t2.png'),
      screen: 'TrackerList',
    },
    {
      label: 'Personal Info',
      icon: require('../../assets/pi.png'),
      screen: 'PersonalInfo',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Welcome Back */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeBlue}>Welcome</Text>
        <Text style={styles.welcomeWhite}>Back</Text>
      </View>

      <Text style={styles.subtitle}>Stay on track with your fitness goals</Text>

      <View style={styles.gridContainer}>
        {buttons.map(({ label, icon, screen }) => (
          <TouchableOpacity
            key={label}
            style={styles.gridButton}
            onPress={() => navigation.navigate(screen)}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrapper}>
              <Image
                source={typeof icon === 'string' ? { uri: icon } : icon}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.buttonLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },

  // Welcome Back
  welcomeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 30,
  },
  welcomeBlue: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: 29,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  welcomeWhite: {
    backgroundColor: 'white',
    color: '#3b82f6',
    fontSize: 29,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },

  subtitle: {
    fontSize: 17,
    color: '#6b7280',
    marginBottom: 60,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  gridButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android shadow
    elevation: 5,
  },
  iconWrapper: {
    width: BUTTON_SIZE * 0.55 + 10,
    height: BUTTON_SIZE * 0.55 + 10,
    borderRadius: (BUTTON_SIZE * 0.55 + 10) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: BUTTON_SIZE * 0.55,
    height: BUTTON_SIZE * 0.55,
    tintColor: '#3b82f6', // icons will be blue inside white circle
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
