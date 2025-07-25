// src/screens/Profile.js
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Upload image to Cloudinary
const uploadImageToCloudinary = async (uri) => {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  });
  data.append('upload_preset', 'barbellblabla'); // your Cloudinary preset
  data.append('cloud_name', 'dumsmhrum'); // your Cloudinary cloud name

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

  // State for username modal
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

  // Replace Alert.prompt with modal
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

  const getDefaultIcon = () => {
    if (!userData?.gender) return require('../../assets/man.png');
    if (userData.gender.toLowerCase() === 'female') return require('../../assets/female.png');
    return require('../../assets/man.png');
  };

  if (!userData) return <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={chooseImageSource}>
        <Image
          source={profilePic ? { uri: profilePic } : getDefaultIcon()}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Text style={styles.name}>{userData.firstName} {userData.lastName}</Text>
      <Text style={styles.email}>{userData.email}</Text>

      <TouchableOpacity style={styles.button} onPress={chooseImageSource}>
        <Ionicons name="camera" size={20} color="#fff" />
        <Text style={styles.buttonText}>Change Profile Picture</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleChangeUsername}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Change Username</Text>
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
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
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
