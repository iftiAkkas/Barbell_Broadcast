import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageSlider from "../app/components/ImageSlider";
import { features } from "./constants/index";

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text style={styles.welcome}>Welcome to</Text>

          <View style={styles.titleWrapper}>
            <View style={styles.highlightAppName}>
              <Text style={styles.appName}>Barbell</Text>
            </View>
            <View style={styles.highlight}>
              <Text style={styles.blue}>Broadcast</Text>
            </View>
          </View>

          <View style={styles.sliderWrapper}>
            <ImageSlider images={features} />
          </View>
        </View>

        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3b82f6",
  },
  container: {
    flex: 1,
    backgroundColor: "#3b82f6",
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 100,
  },
  welcome: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 6,
    marginTop: 40,
  },
  appName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 35,
    lineHeight: 40,
  },
  highlight: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: "center",
    marginLeft: 8,
  },
  highlightAppName: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: "center",
  },
  blue: {
    color: "#3b82f6",
    fontWeight: "bold",
    fontSize: 35,
    lineHeight: 40,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  sliderWrapper: {
    marginTop: 12,
    marginBottom: 20,
  },
  buttonWrapper: {
    alignItems: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 6,
  },
  buttonText: {
    color: "#3b82f6",
    fontWeight: "bold",
    fontSize: 20,
  },
});
