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
      icon: 'https://cdn-icons-png.flaticon.com/128/4721/4721130.png',
      screen: 'ExerciseLog',
    },
    {
      label: 'Routine',
      icon: 'https://cdn-icons-png.flaticon.com/128/3476/3476097.png',
      screen: 'Routine',
    },
    {
      label: 'Trackers',
      icon: 'https://cdn-icons-png.flaticon.com/128/2083/2083582.png',
      screen: 'TrackerList',
    },
    {
      label: 'Personal Info',
      icon: 'https://cdn-icons-png.flaticon.com/128/4117/4117081.png',
      screen: 'PersonalInfo',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.welcomeText}>Welcome Back</Text>
      <Text style={styles.subtitle}>Stay on track with your fitness goals</Text>

      <View style={styles.gridContainer}>
      {buttons.map(({ label, icon, screen }) => (
  <TouchableOpacity
    key={label}
    style={styles.gridButton}
    onPress={() => navigation.navigate(screen)}
    activeOpacity={0.85}
  >
    <Image source={typeof icon === 'string' ? { uri: icon } : icon} style={styles.icon} />
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
    backgroundColor: 'white', // light and clean
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
   // marginTop:60,
  },
  welcomeText: {
    fontSize: 29,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
    marginBottom: 80,
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
    color: '#3b82f6',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Android shadow
    elevation: 5,
  },
  icon: {
    width: BUTTON_SIZE * 0.4,
    height: BUTTON_SIZE * 0.4,
    marginBottom: 12,
  },
buttonLabel: {
  color: 'white',
  fontWeight: '600',
  fontSize: 14,
  textAlign: 'center',
},

});
