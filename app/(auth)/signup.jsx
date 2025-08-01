import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function Signup() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: firstName,
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        birthday: birthday.toISOString().split('T')[0], // saves as YYYY-MM-DD
        gender,
        createdAt: new Date(),
      });

      Alert.alert('Account created!');
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={60}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.heading}>Sign Up</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="First name"
              onChangeText={setFirstName}
              value={firstName}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Last name"
              onChangeText={setLastName}
              value={lastName}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Birthday Picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{birthday ? birthday.toDateString() : 'Select Birthday'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios'); // stay open on iOS
                if (selectedDate) {
                  setBirthday(selectedDate);
                }
              }}
            />
          )}

          {/* Gender Picker */}
          <View style={[styles.input, { padding: 0 }]}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={{ height: 50 }}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />

          <Button title="Sign Up" onPress={handleSignup} />

          <View style={styles.socialRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Google Sign-In not implemented')}
              style={styles.socialButton}
            >
              <FontAwesome name="google" size={32} color="#DB4437" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Facebook not implemented yet')}
              style={styles.socialButton}
            >
              <FontAwesome name="facebook" size={32} color="#4267B2" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 24,
    padding: 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    marginTop: 20,
    color: '#1e90ff',
    textAlign: 'center',
  },
});
