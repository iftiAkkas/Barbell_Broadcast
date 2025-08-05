import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (loading) return; // prevent multiple presses

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Logged in!');
      router.replace('/(tabs)/omi');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.heading}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="white"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="white"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/signup')}
            disabled={loading}
          >
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: '#3b82f6',
    minHeight: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    width: '100%',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: 'white',
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    marginTop: 20,
    color: '#ffffff',
    textAlign: 'center',
  },
});
