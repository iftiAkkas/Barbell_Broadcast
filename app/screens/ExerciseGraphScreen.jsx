import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import {db} from "../../firebase/config"; // ✅ import firebase
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;

// Strength score formula
function calculateStrengthScore(weight, reps) {
  return weight * Math.pow(1 + reps / 40, 1.1);
}

export default function ExerciseGraphScreen({ route }) {
  const { exerciseName, userId } = route.params; // ✅ pass userId
  const [dataPoints, setDataPoints] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const q = query(
          collection(db, "logs", userId, exerciseName),
          orderBy("date", "asc")
        );
        const querySnapshot = await getDocs(q);

        const perDay = {};
        querySnapshot.forEach((doc) => {
          const { date, sets } = doc.data();
          sets.forEach(({ reps, weight }) => {
            const repsNum = parseFloat(reps);
            const weightNum = parseFloat(weight);
            if (!isNaN(repsNum) && !isNaN(weightNum)) {
              const sc = calculateStrengthScore(weightNum, repsNum);
              (perDay[date] ||= []).push({
                reps: repsNum,
                weight: weightNum,
                score: sc,
              });
            }
          });
        });

        // Convert into array
        const points = Object.entries(perDay)
          .map(([date, sets]) => {
            const maxSet = sets.reduce(
              (m, s) => (s.score > m.score ? s : m),
              sets[0]
            );
            return {
              date,
              score: Math.round(maxSet.score),
              sets: sets
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((s) => ({ ...s, score: Math.round(s.score) })),
            };
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setDataPoints(points);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    loadLogs();
  }, [exerciseName, userId]);

  // Default select peak day
  useEffect(() => {
    if (!dataPoints.length) {
      setSelectedIndex(null);
      return;
    }
    let maxIdx = 0;
    for (let i = 1; i < dataPoints.length; i++) {
      if (dataPoints[i].score > dataPoints[maxIdx].score) maxIdx = i;
    }
    setSelectedIndex(maxIdx);
  }, [dataPoints]);

  // Chart Data
  const rawLabels = dataPoints.map((pt) => pt.date.slice(5)); // MM-DD
  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
  const labels = rawLabels.map((d, i) => (i % step === 0 ? d : ""));

  const scores = dataPoints.map((pt) => pt.score);

  const chartData = {
    labels,
    datasets: [
      {
        data: scores,
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 3,
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: "rgba(16, 80, 200, 1)",
    },
    propsForBackgroundLines: {
      strokeDasharray: "3 6",
      stroke: "rgba(0,0,0,0.08)",
      strokeWidth: 1,
    },
    useShadowColorFromDataset: false,
    fillShadowGradient: "rgba(16, 80, 200, 1)",
    fillShadowGradientOpacity: 0.15,
    formatYLabel: () => "",
  };

  // Peak index
  const peakIndex = useMemo(() => {
    if (!dataPoints.length) return null;
    let m = 0;
    for (let i = 1; i < dataPoints.length; i++) {
      if (dataPoints[i].score > dataPoints[m].score) m = i;
    }
    return m;
  }, [dataPoints]);

  const dynamicWidth = Math.max(screenWidth, dataPoints.length * 36);

  const selectedPoint = useMemo(() => {
    if (selectedIndex == null || !dataPoints[selectedIndex]) return null;
    return dataPoints[selectedIndex];
  }, [selectedIndex, dataPoints]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Progress for: {exerciseName}</Text>

      {dataPoints.length > 0 ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartCard}>
              <LineChart
                data={chartData}
                width={dynamicWidth}
                height={260}
                chartConfig={chartConfig}
                withDots
                withInnerLines
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero
                segments={4}
                style={styles.chart}
                onDataPointClick={({ index, x, y, value }) => {
                  setSelectedIndex(index);
                  const p = dataPoints[index];
                  if (p) {
                    const text = `${p.date}\nScore: ${value}\n${
                      p.sets[0]?.weight ?? "-"
                    } kg × ${p.sets[0]?.reps ?? "-"}`;
                    setTooltip({ x, y, text });
                    setTimeout(() => setTooltip(null), 1200);
                  }
                }}
              />
            </View>
          </ScrollView>

          {/* Details Panel */}
          {selectedPoint && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>
                {selectedIndex === peakIndex ? "Peak Day" : "Selected Day"}
              </Text>
              <Text style={styles.detailLine}>
                Date: <Text style={styles.detailStrong}>{selectedPoint.date}</Text>
              </Text>
              <Text style={styles.detailLine}>
                Score: <Text>{selectedPoint.score}</Text>
              </Text>
              <Text style={[styles.detailLine, { marginTop: 8, fontWeight: "800" }]}>
                All Sets
              </Text>
              {selectedPoint.sets.map((s, i) => (
                <Text key={i} style={styles.setLine}>
                  • {s.weight} kg × {s.reps}{" "}
                  <Text style={styles.setScore}>({s.score})</Text>
                </Text>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noData}>No logs available for this exercise yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 16, flexGrow: 1 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 16, color: "#003366" },
  chartCard: { backgroundColor: "#fff", borderRadius: 16, padding: 8, elevation: 3 },
  chart: { borderRadius: 16, marginVertical: 8 },
  detailCard: {
    marginBottom: 180,
    marginTop: 20,
    width: screenWidth - 32,
    backgroundColor: "#3b82f6",
    borderRadius: 14,
    padding: 14,
  },
  detailTitle: { fontSize: 14, fontWeight: "800", color: "#fff", marginBottom: 6 },
  detailLine: { fontSize: 14, color: "#fbfbfb", marginBottom: 2 },
  detailStrong: { fontWeight: "800", color: "#fff" },
  setLine: { fontSize: 14, color: "#fff", marginBottom: 2 },
  setScore: { color: "#fff", fontWeight: "700" },
  noData: { marginTop: 40, fontSize: 16, color: "#555" },
});
