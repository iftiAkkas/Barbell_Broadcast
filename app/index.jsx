import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

export default function Page() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scaleAnim]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>Welcome to</Text>

      <View style={styles.titleWrapper}>
        <View style={styles.highlightAppName}>
          <Text style={styles.appName}>Barbell</Text>
        </View>
        <View style={styles.highlight}>
          <Text style={styles.blue}>Broadcast</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Image
            source={require('../assets/female.png')}
            style={styles.cardImage}
          />
          <Text style={styles.cardText}>Ready for some gains? Start tracking today!</Text>
        </View>
        <View style={styles.card}>
          <Image
            source={require('../assets/female.png')}
            style={styles.cardImage}
          />
          <Text style={styles.cardText}>Log your lifts, monitor progress and improve.</Text>
        </View>
        <View style={styles.card}>
          <Image
            source={require('../assets/female.png')}
            style={styles.cardImage}
          />
          <Text style={styles.cardText}>Make consistent effort a lifestyle.</Text>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0066ee',
    alignItems: 'center',
    padding: 24,
    paddingTop: 280,
    paddingBottom: 40,
  },
  welcome: {
    fontSize: 18,
    color: 'white',
    marginBottom: 6,
  },
  appName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 35,
    lineHeight: 34,
  },
  highlight: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'center',
  },
  highlightAppName: {
    backgroundColor: '#0066ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'center',
  },
  blue: {
    color: '#0066ee',
    fontWeight: 'bold',
    fontSize: 35,
    lineHeight: 34,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 35,
    flexWrap: 'wrap',
  },
  card: {
    width: 110,
    alignItems: 'center',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 6,
  },
  buttonText: {
    color: '#007aff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
