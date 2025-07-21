import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { db } from '../../firebase/config'; // 👈 import Firestore
import { doc, setDoc } from 'firebase/firestore'; // 👈 import methods


WebBrowser.maybeCompleteAuthSession();

export default function Signup() {
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '231925583013-8nj0b0tm9qm87uii2luud7ksdfg8n569.apps.googleusercontent.com',
    //iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    webClientId: '796056669419-t1cvpfhgd7nsta9qdhm05cm6ipnc1856.apps.googleusercontent.com',
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert('Signed in with Google!');
          router.replace('/');
        })
        .catch((err) => Alert.alert('Google Sign-In Failed', err.message));
    }
  }, [response]);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    try {
      const userCredential=await createUserWithEmailAndPassword(auth, email, password);
      const user=userCredential.user;

      await updateProfile(user, {
      displayName: firstName,
    });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      birthday: birthday,
      gender: gender,
      createdAt: new Date(),
    });

      Alert.alert('Account created!');
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
      //router.replace('/')
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
            <TouchableOpacity
              onPress={() => promptAsync()}
              style={styles.socialButton}
              disabled={!request}
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
