import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (

    
    
    <View style={styles.container}>

      <TouchableOpacity
  style={styles.profileIcon}
  onPress={() => navigation.navigate('Personal Info')}
>
  <Text style={styles.profileIconText}>👤</Text>
</TouchableOpacity>

      <Text style={styles.header}>Barbell Broadcast</Text>
 
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Routine')}
      >
        <Text style={styles.btnText}>Routine</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('ExerciseLog')}
      >
        <Text style={styles.btnText}>Workout Log</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('TrackerList')}
      >
        <Text style={styles.btnText}>Trackers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => alert('Coming soon!')}
      >
        <Text style={styles.btnText}>Social Platform</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => alert('Chatbot coming soon!')}
      >
        <Text style={styles.btnText}>Gymbot</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  btn: {
    backgroundColor: '#07c5ffff',
    padding: 14,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
profileIcon: {
  position: 'absolute',
  top: 16,
  left: 16,
  zIndex: 10,
  padding: 8,
  backgroundColor: '#eee',
  borderRadius: 20,
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 2,
},
profileIconText: {
  fontSize: 20,
}


  
});
