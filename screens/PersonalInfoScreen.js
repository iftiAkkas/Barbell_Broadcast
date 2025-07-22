import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PersonalInfoScreen() {
  const [info, setInfo] = useState({
    name: '',
    age: '',
    gender: 'male',
    heightFt: '',
    heightIn: '',
    weight: '',
    prs: [], // [{ name: 'Bench Press', value: '80kg' }]
  });
  const [isEditing, setIsEditing] = useState(true);
  const [newPRName, setNewPRName] = useState('');
  const [newPRValue, setNewPRValue] = useState('');
  const [showPRModal, setShowPRModal] = useState(false);
  const [newPR, setNewPR] = useState({ name: '', weight: '', reps: '' });


  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const stored = await AsyncStorage.getItem('personalInfo');
    if (stored) {
      setInfo(JSON.parse(stored));
      setIsEditing(false);
    }
  };

  const saveInfo = async () => {
    await AsyncStorage.setItem('personalInfo', JSON.stringify(info));
    setIsEditing(false);
    Alert.alert('Saved!');
  };

  const addPR = () => {
  if (!newPR.name || !newPR.weight || !newPR.reps) return;
  const updated = [...prs, newPR];
  setPrs(updated);
  AsyncStorage.setItem('personalPRs', JSON.stringify(updated));
  setNewPR({ name: '', weight: '', reps: '' });
  setShowPRModal(false);
};


const calculateMaintenanceCalories = () => {
  const age = parseInt(info.age);
  const height =
    parseInt(info.heightFeet || 0) * 30.48 +
    parseInt(info.heightInches || 0) * 2.54;
  const weight = parseFloat(info.weight);
  const activity = parseFloat(info.activity);

  if (isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(activity)) return 'N/A';

  let bmr =
    info.gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * activity;

  return Math.round(tdee) + ' kcal';
};


  return (
    <ScrollView style={styles.container}>
      <View style={styles.rowEnd}>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={info.name}
        editable={isEditing}
        onChangeText={(t) => setInfo({ ...info, name: t })}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={info.age}
        keyboardType="numeric"
        editable={isEditing}
        onChangeText={(t) => setInfo({ ...info, age: t })}
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {['male', 'female'].map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.genderBtn,
              info.gender === g && styles.genderSelected,
            ]}
            disabled={!isEditing}
            onPress={() => setInfo({ ...info, gender: g })}
          >
            <Text
              style={[
                styles.genderText,
                info.gender === g && styles.genderTextSelected,
              ]}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Height</Text>
      <View style={styles.heightRow}>
        <TextInput
          style={styles.heightInput}
          placeholder="ft"
          keyboardType="numeric"
          value={info.heightFt}
          editable={isEditing}
          onChangeText={(t) => setInfo({ ...info, heightFt: t })}
        />
        <TextInput
          style={styles.heightInput}
          placeholder="in"
          keyboardType="numeric"
          value={info.heightIn}
          editable={isEditing}
          onChangeText={(t) => setInfo({ ...info, heightIn: t })}
        />
      </View>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={info.weight}
        keyboardType="numeric"
        editable={isEditing}
        onChangeText={(t) => setInfo({ ...info, weight: t })}
      />

      <Text style={styles.label}>Maintenance Calories</Text>
      <Text style={styles.calories}>{calculateMaintenanceCalories()}</Text>

      <TouchableOpacity
        style={styles.prBtn}
        onPress={() => setShowPRModal(true)}
      >
        <Text style={styles.prBtnText}>Your PRs</Text>
      </TouchableOpacity>

      {info.prs.length > 0 && (
        <>
          <Text style={styles.label}>Custom Stats</Text>
          {info.prs.map((pr, i) => (
            <Text key={i} style={styles.prItem}>
              • {pr.name}: {pr.value}
            </Text>
          ))}
        </>
      )}

      {isEditing && (
        <TouchableOpacity style={styles.saveBtn} onPress={saveInfo}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      )}

 <Modal visible={showPRModal} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.label}>New PR</Text>

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

      <TouchableOpacity style={styles.saveBtn} onPress={addPR}>
        <Text style={styles.saveText}>Save PR</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowPRModal(false)}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
    backgroundColor: '#fff',
  },
  genderRow: { flexDirection: 'row', marginTop: 10 },
  genderBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 10,
  },
  genderSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  genderText: { color: '#000' },
  genderTextSelected: { color: '#fff' },
  heightRow: { flexDirection: 'row', gap: 10 },
  heightInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  prBtn: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  prBtnText: { color: '#fff', fontWeight: 'bold' },
  prItem: { marginTop: 6, fontSize: 15 },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 6,
    marginTop: 30,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  editBtn: { fontSize: 16, color: '#007bff' },
  calories: {
    fontSize: 16,
    color: '#333',
    marginTop: 6,
    fontWeight: '600',
  },
  rowEnd: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  cancelText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});
