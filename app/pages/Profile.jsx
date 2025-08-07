// src/screens/Profile.js
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';

// Upload image to Cloudinary
const uploadImageToCloudinary = async (uri) => {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  });
  data.append('upload_preset', 'barbellblabla');
  data.append('cloud_name', 'dumsmhrum');

  const response = await fetch('https://api.cloudinary.com/v1_1/dumsmhrum/image/upload', {
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Upload failed');
  return result.secure_url;
};

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserData(data);
        setProfilePic(data?.profileImage || null);
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  const chooseImageSource = () => {
    Alert.alert(
      'Select Image Source',
      'Choose where to get your image',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    handleImageResult(result);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Media library access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    handleImageResult(result);
  };

  const handleImageResult = async (result) => {
    if (!result.canceled) {
      try {
        const imageUri = result.assets[0].uri;
        const uploadedUrl = await uploadImageToCloudinary(imageUri);
        setProfilePic(uploadedUrl);

        const docRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(
          docRef,
          {
            ...userData,
            profileImage: uploadedUrl,
          },
          { merge: true }
        );

        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const handleChangeUsername = () => {
    setNewName('');
    setShowUsernameModal(true);
  };

  const saveNewUsername = async () => {
    try {
      const [first, ...rest] = newName.trim().split(' ');
      const last = rest.join(' ');
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(
        docRef,
        {
          ...userData,
          firstName: first,
          lastName: last,
        },
        { merge: true }
      );
      setShowUsernameModal(false);
      fetchUserData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update username');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/');
            } catch (error) {
              Alert.alert('Logout Failed', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getDefaultIcon = () => {
    if (!userData?.gender) return require('../../assets/man.png');
    if (userData.gender.toLowerCase() === 'female') return require('../../assets/female.png');
    return require('../../assets/man.png');
  };

  if (!userData)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={chooseImageSource}>
        <Image
          source={profilePic ? { uri: profilePic } : getDefaultIcon()}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Text style={styles.name}>
        {userData.firstName} {userData.lastName}
      </Text>
      <Text style={styles.email}>{userData.email}</Text>

      <View style={styles.gridRow}>
        <TouchableOpacity style={styles.gridButton} onPress={chooseImageSource}>
          <Ionicons name="camera" style={styles.gridIcon} color="#fff" />
          <Text style={styles.gridLabel}>Change Picture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton} onPress={handleChangeUsername}>
          <Ionicons name="create-outline" style={styles.gridIcon} color="#fff" />
          <Text style={styles.gridLabel}>Change Name</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#dc3545', marginTop: 40, width: '100%' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Username change modal */}
      <Modal
        visible={showUsernameModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <TextInput
              placeholder="Enter new username (First Last)"
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#6c757d' }]}
                onPress={() => setShowUsernameModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={saveNewUsername}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 32,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  gridButton: {
    width: 140,
    height: 100,
    backgroundColor: '#007bff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gridIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  gridLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '85%',
    padding: 20,
    borderRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
