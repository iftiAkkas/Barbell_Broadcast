import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../firebase/config';

// ===== helpers (keep outside component) =====
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function scorePassword(pw) {
  if (!pw) return 0; // 0..4
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}
const strengthLabel = ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'];
const strengthColor = ['#DC2626', '#D97706', '#9CA3AF', '#2563EB', '#059669'];

export default function Signup() {
  const router = useRouter();

  // ===== your existing state =====
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');

  // ===== added state (must be inside component) =====
  const [emailError, setEmailError] = useState('');
  const [emailInUse, setEmailInUse] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [passScore, setPassScore] = useState(0);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (emailInUse) {
      Alert.alert('Email in use', 'This email is already registered. Try logging in.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: firstName });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: email.trim(),
        birthday: birthday ? birthday.toISOString().split('T')[0] : null,
        gender,
        createdAt: new Date(),
      });

      Alert.alert('Account created!');
      router.replace('/(tabs)/omi');
    } catch (error) {
      // friendlier Firebase errors
      const code = error?.code || '';
      let msg = error.message;
      if (code === 'auth/email-already-in-use') msg = 'This email is already in use. Try logging in.';
      else if (code === 'auth/invalid-email') msg = 'That email looks invalid.';
      else if (code === 'auth/weak-password') msg = 'Your password is too weak. Add symbols & numbers.';
      else if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
      else if (code === 'auth/operation-not-allowed') msg = 'Email/password sign-up is disabled.';
      Alert.alert('Signup Failed', msg);
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
              placeholderTextColor="#999"
              onChangeText={setFirstName}
              value={firstName}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Last name"
              placeholderTextColor="#999"
              onChangeText={setLastName}
              value={lastName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            onChangeText={(t) => {
              setEmail(t);
              setEmailError('');
              setEmailInUse(false);
            }}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            onEndEditing={async () => {
              if (!email) return;
              if (!emailRegex.test(email)) {
                setEmailError('Enter a valid email address');
                return;
              }
              try {
                setCheckingEmail(true);
                const methods = await fetchSignInMethodsForEmail(auth, email.trim());
                setEmailInUse((methods || []).length > 0);
              } catch (e) {
                // optional: handle network/format errors
              } finally {
                setCheckingEmail(false);
              }
            }}
          />
          {checkingEmail ? (
            <Text style={{ color: '#666', marginTop: -12, marginBottom: 8 }}>Checking email…</Text>
          ) : emailError ? (
            <Text style={{ color: '#DC2626', marginTop: -12, marginBottom: 8 }}>{emailError}</Text>
          ) : emailInUse ? (
            <Text style={{ color: '#DC2626', marginTop: -12, marginBottom: 8 }}>
              This email is already in use. Try logging in.
            </Text>
          ) : null}

          {/* Birthday */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={{ color: birthday ? '#000' : '#999' }}>
              {birthday ? birthday.toDateString() : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthday || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setBirthday(selectedDate);
              }}
              maximumDate={new Date()}
            />
          )}

          {/* Gender */}
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

          {/* Password */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={(t) => {
              setPassword(t);
              setPassScore(scorePassword(t)); // strength tied to PASSWORD
            }}
            value={password}
          />

          {/* Password strength bar + labels */}
          <View style={{ marginTop: -8, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 6,
                    backgroundColor: i < passScore ? strengthColor[passScore] : '#E2E8F0',
                  }}
                />
              ))}
            </View>
            <Text style={{ color: strengthColor[passScore], fontSize: 12 }}>
              {strengthLabel[passScore]}
            </Text>
            <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
              Use 8+ chars with upper & lower case, a number, and a symbol.
            </Text>
          </View>

          {/* Confirm Password */}
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
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
    marginTop:40,
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
    color: '#000',
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
