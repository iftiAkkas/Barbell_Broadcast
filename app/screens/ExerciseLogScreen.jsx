import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { db, auth } from "../../firebase/config";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

export default function ExerciseLogScreen() {
  const [log, setLog] = useState({});
  const [additionalExercises, setAdditionalExercises] = useState([]);
  const [logsForDay, setLogsForDay] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Monday"); // example
  const [logDate, setLogDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadLogsForDay();
  }, [selectedDay]);

  const handleChange = (exercise, index, field, value) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (!updated[exercise]) updated[exercise] = [];
      updated[exercise][index] = {
        ...updated[exercise][index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleAdditionalChange = (exerciseIndex, setIndex, field, value) => {
    setAdditionalExercises((prev) => {
      const updated = [...prev];
      if (!updated[exerciseIndex].sets[setIndex]) {
        updated[exerciseIndex].sets[setIndex] = {};
      }
      updated[exerciseIndex].sets[setIndex][field] = value;
      return updated;
    });
  };

  const addExercise = () => {
    setAdditionalExercises((prev) => [
      ...prev,
      { name: "", sets: [{ reps: "", weight: "" }] },
    ]);
  };

  const addSet = (exerciseIndex) => {
    setAdditionalExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex].sets.push({ reps: "", weight: "" });
      return updated;
    });
  };

  const saveLog = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to save logs");
        return;
      }

      // Clean log data
      const cleanedLog = {};
      Object.entries(log).forEach(([exercise, sets]) => {
        const validSets = sets.filter((s) => s.reps || s.weight);
        if (validSets.length > 0) cleanedLog[exercise] = validSets;
      });

      const cleanedAdditional = additionalExercises
        .map((ae) => ({
          ...ae,
          sets: ae.sets.filter((s) => s.reps || s.weight),
        }))
        .filter((ae) => ae.name.trim() && ae.sets.length > 0);

      const todayLog = {
        log: cleanedLog,
        additionalExercises: cleanedAdditional,
        userId: user.uid,
        day: selectedDay,
        logDate,
        createdAt: new Date(),
      };

      await setDoc(
        doc(
          collection(db, "workoutLogs"),
          `${user.uid}_${logDate}_${selectedDay}`
        ),
        todayLog
      );

      Alert.alert("Saved", "Workout saved to database!");
      loadLogsForDay();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save workout");
    }
  };

  const loadLogsForDay = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "workoutLogs"),
        where("userId", "==", user.uid),
        where("day", "==", selectedDay)
      );
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => results.push(doc.data()));
      setLogsForDay(results);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLog = async (logId) => {
    try {
      await deleteDoc(doc(db, "workoutLogs", logId));
      loadLogsForDay();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Log ({selectedDay})</Text>

      <TouchableOpacity style={styles.addBtn} onPress={addExercise}>
        <Text style={styles.addBtnText}>+ Add Exercise</Text>
      </TouchableOpacity>

      {additionalExercises.map((ex, i) => (
        <View key={i} style={styles.exerciseBox}>
          <TextInput
            style={styles.input}
            placeholder="Exercise Name"
            value={ex.name}
            onChangeText={(t) => {
              const updated = [...additionalExercises];
              updated[i].name = t;
              setAdditionalExercises(updated);
            }}
          />
          {ex.sets.map((set, j) => (
            <View key={j} style={styles.setRow}>
              <TextInput
                style={styles.smallInput}
                placeholder="Reps"
                value={set.reps}
                onChangeText={(t) =>
                  handleAdditionalChange(i, j, "reps", t)
                }
                keyboardType="numeric"
              />
              <TextInput
                style={styles.smallInput}
                placeholder="Weight"
                value={set.weight}
                onChangeText={(t) =>
                  handleAdditionalChange(i, j, "weight", t)
                }
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.addSetBtn}
            onPress={() => addSet(i)}
          >
            <Text style={styles.addSetText}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={saveLog}>
        <Text style={styles.saveBtnText}>Save Workout</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Saved Logs</Text>
      <FlatList
        data={logsForDay}
        keyExtractor={(item) => item.logDate + "_" + item.day}
        renderItem={({ item }) => (
          <View style={styles.logBox}>
            <Text style={styles.logTitle}>
              {item.logDate} - {item.day}
            </Text>
            {Object.entries(item.log).map(([exercise, sets], idx) => (
              <View key={idx}>
                <Text style={styles.exerciseTitle}>{exercise}</Text>
                {sets.map((s, i) => (
                  <Text key={i}>
                    Set {i + 1}: {s.reps} reps @ {s.weight}kg
                  </Text>
                ))}
              </View>
            ))}
            {item.additionalExercises.map((ae, i) => (
              <View key={i}>
                <Text style={styles.exerciseTitle}>{ae.name}</Text>
                {ae.sets.map((s, j) => (
                  <Text key={j}>
                    Set {j + 1}: {s.reps} reps @ {s.weight}kg
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "white" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: "600", marginVertical: 10 },
  exerciseBox: {
    backgroundColor: "#f1f5f9",
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  setRow: { flexDirection: "row", gap: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    backgroundColor: "white",
  },
  smallInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 6,
    backgroundColor: "white",
  },
  addBtn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addBtnText: { color: "white", fontWeight: "600" },
  addSetBtn: { marginTop: 6 },
  addSetText: { color: "#3b82f6", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  logBox: {
    padding: 12,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
    borderRadius: 8,
  },
  logTitle: { fontWeight: "700", marginBottom: 4 },
  exerciseTitle: { fontWeight: "600", marginTop: 6 },
});
