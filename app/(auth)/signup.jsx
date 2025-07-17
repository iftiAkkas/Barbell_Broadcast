import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Account created!');
      router.replace('/');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  const handleGoogleSignup = () => {
    Alert.alert('Google signup not implemented');
  };
  const handleFacebookSignup = () => {
    Alert.alert('Facebook signup not implemented');
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
          <TextInput
            style={styles.input}
            placeholder="Birthday (YYYY-MM-DD)"
            onChangeText={setBirthday}
            value={birthday}
          />
          <TextInput
            style={styles.input}
            placeholder="Gender (optional)"
            onChangeText={setGender}
            value={gender}
          />
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
            <TouchableOpacity onPress={handleGoogleSignup} style={styles.socialButton}>
              <FontAwesome name="google" size={32} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFacebookSignup} style={styles.socialButton}>
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
    marginHorizontal: 16,
  },
  linkText: {
    marginTop: 20,
    color: '#1e90ff',
    textAlign: 'center',
  },
});