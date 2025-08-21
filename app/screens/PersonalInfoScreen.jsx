import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../../firebase/config"; // ✅ auth included
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function PersonalInfoScreen() {
  const [info, setInfo] = useState({
    name: "",
    age: "",
    gender: "male",
    heightFt: "",
    heightIn: "",
    weight: "",
    prs: [],
    activityLevel: "Active",
  });

  const [isEditing, setIsEditing] = useState(true);
  const [showPRModal, setShowPRModal] = useState(false);
  const [newPR, setNewPR] = useState({
    name: "",
    weight: "",
    reps: "",
    isFavorite: false,
  });
  const [prs, setPrs] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        loadInfo(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  // 🔥 Load from Firestore first, fallback to AsyncStorage
  const loadInfo = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setInfo(data);
        setPrs(data.prs || []);
        setIsEditing(false);
      } else {
        const stored = await AsyncStorage.getItem("personalInfo");
        if (stored) {
          const parsed = JSON.parse(stored);
          setInfo(parsed);
          setPrs(parsed.prs || []);
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.log("Load error:", err);
    }
  };

  // 🔥 Save to Firestore + AsyncStorage
  const saveInfo = async () => {
    if (!userId) return;

    const updatedInfo = { ...info, prs };
    setInfo(updatedInfo);

    try {
      await setDoc(doc(db, "users", userId), updatedInfo, { merge: true });
      await AsyncStorage.setItem("personalInfo", JSON.stringify(updatedInfo));
      setIsEditing(false);
      Alert.alert("Saved!");
    } catch (err) {
      console.log("Save error:", err);
    }
  };

  // 🔥 Add PR
  const addPR = async () => {
    if (!newPR.name || !newPR.weight || !newPR.reps) {
      Alert.alert("Please fill all PR fields");
      return;
    }
    const updatedPRs = [...prs, newPR];
    setPrs(updatedPRs);
    setInfo({ ...info, prs: updatedPRs });

    try {
      await updateDoc(doc(db, "users", userId), {
        prs: arrayUnion(newPR),
      });
      await AsyncStorage.setItem(
        "personalInfo",
        JSON.stringify({ ...info, prs: updatedPRs })
      );
    } catch (err) {
      console.log("Add PR error:", err);
    }

    setNewPR({ name: "", weight: "", reps: "", isFavorite: false });
    setShowPRModal(false);
  };

  // 🔥 Toggle favorite (limit 3)
  const toggleFavorite = async (index) => {
    const updated = [...prs];
    const selected = updated[index];
    const isCurrentlyFavorite = selected.isFavorite;
    const favoriteCount = updated.filter((pr) => pr.isFavorite).length;

    if (!isCurrentlyFavorite && favoriteCount >= 3) {
      Alert.alert("Limit Reached", "You can only select up to 3 favorite stats.");
      return;
    }

    updated[index].isFavorite = !isCurrentlyFavorite;
    setPrs(updated);
    setInfo({ ...info, prs: updated });

    try {
      await setDoc(doc(db, "users", userId), { prs: updated }, { merge: true });
      await AsyncStorage.setItem(
        "personalInfo",
        JSON.stringify({ ...info, prs: updated })
      );
    } catch (err) {
      console.log("Favorite update error:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>👤 Personal Info</Text>

        <View style={styles.card}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={info.name}
                onChangeText={(text) => setInfo({ ...info, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={info.age}
                onChangeText={(text) => setInfo({ ...info, age: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                keyboardType="numeric"
                value={info.weight}
                onChangeText={(text) => setInfo({ ...info, weight: text })}
              />
              <TouchableOpacity style={styles.button} onPress={saveInfo}>
                <Text style={styles.buttonText}>💾 Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>Name: {info.name}</Text>
              <Text style={styles.infoText}>Age: {info.age}</Text>
              <Text style={styles.infoText}>Weight: {info.weight} kg</Text>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>✏️ Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* PR Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏆 Personal Records</Text>
          {prs.length === 0 ? (
            <Text style={{ color: "#777", marginBottom: 10 }}>
              No PRs added yet
            </Text>
          ) : (
            prs.map((pr, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.prItem,
                  pr.isFavorite && { borderColor: "gold", borderWidth: 2 },
                ]}
                onPress={() => toggleFavorite(i)}
              >
                <Text style={styles.prText}>
                  {pr.name} - {pr.weight}kg x {pr.reps} reps
                </Text>
                <Text style={{ color: pr.isFavorite ? "gold" : "#999" }}>
                  {pr.isFavorite ? "★ Favorite" : "☆"}
                </Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={[styles.button, { marginTop: 15 }]}
            onPress={() => setShowPRModal(true)}
          >
            <Text style={styles.buttonText}>➕ Add PR</Text>
          </TouchableOpacity>
        </View>

        {/* PR Modal */}
        <Modal visible={showPRModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Add New PR</Text>
              <TextInput
                placeholder="Exercise Name"
                style={styles.input}
                value={newPR.name}
                onChangeText={(t) => setNewPR({ ...newPR, name: t })}
              />
              <TextInput
                placeholder="Weight (kg)"
                style={styles.input}
                keyboardType="numeric"
                value={newPR.weight}
                onChangeText={(t) => setNewPR({ ...newPR, weight: t })}
              />
              <TextInput
                placeholder="Reps"
                style={styles.input}
                keyboardType="numeric"
                value={newPR.reps}
                onChangeText={(t) => setNewPR({ ...newPR, reps: t })}
              />
              <TouchableOpacity style={styles.button} onPress={addPR}>
                <Text style={styles.buttonText}>💾 Save PR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPRModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#111" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: { backgroundColor: "#2563eb" },
  buttonText: { color: "white", fontWeight: "600" },
  infoText: { fontSize: 16, marginBottom: 5 },
  prItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginBottom: 8,
  },
  prText: { fontSize: 15 },
  cancelButton: { marginTop: 10, padding: 10 },
  cancelText: { color: "red", textAlign: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
});
