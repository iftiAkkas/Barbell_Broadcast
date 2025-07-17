import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Page() {
  const router = useRouter(); // ⬅️ get router instance

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Ifti</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>

        {/* Sign In Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/login")} // navigate to login page
        >
          <Text style={styles.buttonText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});
