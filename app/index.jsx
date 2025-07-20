import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Page() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/fitness2.jpg')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={4}
      //imageStyle={{ left: -60 }}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Fitness Tracker</Text>
        <Text style={styles.subtitle}>Track your workouts, progress, and stay motivated!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center', // ensures overlay is centered
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});