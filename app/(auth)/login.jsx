// import { useRouter } from 'expo-router';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import React, { useState } from 'react';
// import {
//   View,
//   TextInput,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { auth } from '../../firebase/config';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleLogin = async () => {
//     if (loading) return; // prevent multiple presses

//     setLoading(true);
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       Alert.alert('Logged in!');
//       router.replace('/(tabs)/omi');
//     } catch (error) {
//       Alert.alert('Login Failed', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={60}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
//         <View style={styles.container}>
//           <Text style={styles.heading}>Login</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             placeholderTextColor="#999"
//             onChangeText={setEmail}
//             value={email}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             editable={!loading}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Password"
//             placeholderTextColor="#999"
//             secureTextEntry
//             onChangeText={setPassword}
//             value={password}
//             editable={!loading}
//           />

//           <TouchableOpacity
//             style={[styles.loginButton, loading && styles.loginButtonDisabled]}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#1e90ff" />
//             ) : (
//               <Text style={styles.loginButtonText}>Login</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => router.push('/signup')} disabled={loading}>
//             <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   heading: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     color: '#000',
//   },
//   loginButton: {
//     backgroundColor: '#1e90ff',
//     paddingVertical: 14,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   loginButtonDisabled: {
//     opacity: 0.7,
//   },
//   loginButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   linkText: {
//     marginTop: 20,
//     color: '#1e90ff',
//     textAlign: 'center',
//   },
// });







//above lines are the real code
//these are just temporary to skip log in
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // 🚨 TEMP: Always skip login during development
    router.replace('/(tabs)/omi');
  }, []);

  return null; // No UI needed
}
