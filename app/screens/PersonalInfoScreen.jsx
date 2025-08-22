//btnLabel not working for Click to View All Stats

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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function PersonalInfoScreen() {
const [info, setInfo] = useState({
  name: '',
  age: '',
  gender: 'male',
  heightFt: '',
  heightIn: '',
  weight: '',
  prs: [],
  activityLevel: 'Active', // default value
});


  const [isEditing, setIsEditing] = useState(true);
  const [newPRName, setNewPRName] = useState('');
  const [newPRValue, setNewPRValue] = useState('');
  const [showPRModal, setShowPRModal] = useState(false);
 const [newPR, setNewPR] = useState({ name: '', weight: '', reps: '', isFavorite: false });

  const [prs, setPrs] = useState([]);


  useEffect(() => {
    loadInfo();
  }, []);

const loadInfo = async () => {
  const stored = await AsyncStorage.getItem('personalInfo');
  if (stored) {
    const parsed = JSON.parse(stored);
    setInfo(parsed);
    setPrs(parsed.prs || []);  // 🟢 Load PRs correctly here
    setIsEditing(false);
  }
};

const saveInfo = async () => {
  const updatedInfo = { ...info, prs };  // 🟢 Make sure prs is synced
  setInfo(updatedInfo);
  await AsyncStorage.setItem('personalInfo', JSON.stringify(updatedInfo));
  setIsEditing(false);
  Alert.alert('Saved!');
};

const addPR = () => {
  if (!newPR.name || !newPR.weight || !newPR.reps) {
    Alert.alert('Please fill all PR fields');
    return;
  }

  const updatedPRs = [...prs, newPR];
  setPrs(updatedPRs);
  setInfo({ ...info, prs: updatedPRs });
  AsyncStorage.setItem('personalInfo', JSON.stringify({ ...info, prs: updatedPRs }));

  setNewPR({ name: '', weight: '', reps: '', isFavorite: false });
  setShowPRModal(false);
};

const toggleFavorite = (index) => {
  const updated = [...prs];
  const selected = updated[index];

  const isCurrentlyFavorite = selected.isFavorite;
  const favoriteCount = updated.filter((pr) => pr.isFavorite).length;

  if (!isCurrentlyFavorite && favoriteCount >= 3) {
    Alert.alert('Limit Reached', 'You can only select up to 3 favorite stats.');
    return;
  }

  updated[index].isFavorite = !isCurrentlyFavorite;
  setPrs(updated);
  setInfo({ ...info, prs: updated });
  AsyncStorage.setItem('personalInfo', JSON.stringify({ ...info, prs: updated }));
};





const deletePR = async (index) => {
  const updated = [...prs];
  updated.splice(index, 1);
  const updatedInfo = { ...info, prs: updated };

  setPrs(updated);
  setInfo(updatedInfo);
  await AsyncStorage.setItem('personalInfo', JSON.stringify(updatedInfo));
};



const calculateMaintenanceCalories = () => {
  const age = parseInt(info.age);
  const height =
    parseInt(info.heightFt || 0) * 30.48 +
    parseInt(info.heightIn || 0) * 2.54;
  const weight = parseFloat(info.weight);

  if (isNaN(age) || isNaN(height) || isNaN(weight)) return 'N/A';

  const bmr =
    info.gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * 1.55; // Moderate activity by default

  return Math.round(tdee) + ' kcal';
};


return (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

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

      {!isEditing &&(
      <TouchableOpacity
        style={styles.prBtn}
        onPress={() => setShowPRModal(true)}
      >
        <Text style={styles.prBtnText}>Click To View All Stats</Text>
      </TouchableOpacity>
    )}
{!isEditing && (
  <>
    {/* Top 3 Favorite Stats */}
    {prs.filter((pr) => pr.isFavorite).length > 0 && (
      <>
        <Text style={styles.TopPRLabel}>Your Best Stats</Text>
        {prs
          .filter((pr) => pr.isFavorite)
          .slice(0, 3)
          .map((pr, i) => (
            <Text key={i} style={styles.topPRItem}>
              • {pr.name}: {pr.weight} kg × {pr.reps} reps
            </Text>
          ))}
      </>
    )}

  
  </>
)}





      {isEditing && (
        <TouchableOpacity style={styles.saveBtn} onPress={saveInfo}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      )}


{/* PR Bottom Sheet Modal */}
<Modal visible={showPRModal} transparent animationType="slide">
  <View style={styles.prModalOverlay}>
    <View style={styles.prModalSheet}>
      <Text style={styles.modalTitle}>Your Personal Records</Text>

      <ScrollView style={styles.modalScroll} nestedScrollEnabled>
       {prs.map((pr, i) => (
  <View key={i} style={styles.prItemRow}>
    <TouchableOpacity onPress={() => toggleFavorite(i)}>
      <Text style={{ color: pr.isFavorite ? 'gold' : 'gray' }}>
        {pr.isFavorite ? '★' : '☆'}
      </Text>
    </TouchableOpacity>
    <Text style={styles.prItemText}>
      • {pr.name}: {pr.weight} kg × {pr.reps} reps
    </Text>
    <TouchableOpacity
      onPress={() =>
        Alert.alert(
          'Delete Record',
          'Are you sure you want to delete this stat?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deletePR(i) },
          ]
        )
      }
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  </View>
))}

      </ScrollView>

      <Text style={[styles.label, styles.btnLabel]}>Add New Stat</Text>
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
        <Text style={styles.saveText}>Save New Stat</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowPRModal(false)}>
        <Text style={styles.cancelText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>




     </ScrollView>
  </KeyboardAvoidingView>
);

}

const styles = StyleSheet.create({
  container: { padding: 20, },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
    backgroundColor: '#fffcfcff',
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
  prList: {
  maxHeight: 200,    
  marginTop: 6,
},
  prBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 6,
    marginTop: 30,
    alignItems: 'center',
  },
  btnLabel:{
     color: 'white',
     fontWeight: 'bold',
  },
prItemRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 6,
},
prItemText: {
  fontSize: 15,
  color: '#010101ff',
  
},
deleteText: {
  color: 'red',
  marginLeft: 10,
},
  saveBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 6,
    marginTop: 30,
    alignItems: 'center',
  },
  
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  editBtn: { fontSize: 16, color: '#3b82f6' },
  calories: {
    fontSize: 16,
    color: '#050505ff',
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
  padding: 24,
  paddingBottom: 40,
  minHeight: 300,
},

  cancelText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  prRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 6,
},
deleteText: {
  color: 'red',
  fontWeight: '600',
},
prItemRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 8,
  paddingVertical: 4,
  borderBottomWidth: 1,
  borderColor: '#ccc',
},
prItemText: {
  fontSize: 15,
  flex: 1,
  
},
prBtnText:{
  color: 'white',
  fontWeight: 500,
},
topPRItem: {
  marginBottom: 8,
  fontSize: 15,
  fontWeight: 500,
},

TopPRLabel:{
   fontSize: 17,
   fontWeight: "600",
   marginLeft: 6,
   marginTop: 15,
  marginBottom: 8,
},

deleteText: {
  color: 'red',
  marginLeft: 10,
  fontWeight: 'bold',
},

pickerWrapper: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 10,
},
activityBtn: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderRadius: 6,
  marginRight: 6,
  marginTop: 6,
},
activitySelected: {
  backgroundColor: '#007bff',
  borderColor: '#007bff',
},
activityText: {
  color: '#000',
},
activityTextSelected: {
  color: '#fff',
},
valueText: {
  fontSize: 16,
  marginTop: 6,
  fontWeight: '500',
  color: '#333',
},
prModalOverlay: {
  flex: 1,
  backgroundColor: '#00000088',
  justifyContent: 'flex-end',
},
prModalSheet: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '90%',
  padding: 20,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},
modalScroll: {
  maxHeight: 200,
  marginBottom: 10,
},

});


