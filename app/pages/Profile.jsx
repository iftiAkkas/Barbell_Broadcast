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
  ScrollView,
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

  const [showBioModal, setShowBioModal] = useState(false);
  const [newBio, setNewBio] = useState('');

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

  const handleChangeBio = () => {
    setNewBio(userData?.bio || '');
    setShowBioModal(true);
  };

  const saveNewBio = async () => {
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(
        docRef,
        {
          ...userData,
          bio: newBio.trim(),
        },
        { merge: true }
      );
      setShowBioModal(false);
      fetchUserData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update bio');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
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
    <ScrollView contentContainerStyle={styles.container}>
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

      {userData.bio ? (
        <Text style={styles.bio}>{userData.bio}</Text>
      ) : (
        <Text style={[styles.bio, { fontStyle: 'italic', color: 'gray' }]}>No bio added yet</Text>
      )}

      {/* Small Edit Bio Button placed right below bio text */}
      <TouchableOpacity style={styles.editBioButton} onPress={handleChangeBio}>
        <Text style={styles.editBioText}>Edit Bio</Text>
      </TouchableOpacity>

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

      {/* Username Modal */}
      <Modal visible={showUsernameModal} animationType="slide" transparent>
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

      {/* Bio Modal */}
      <Modal visible={showBioModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Bio</Text>
            <TextInput
              placeholder="Write something about yourself..."
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              value={newBio}
              onChangeText={setNewBio}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#6c757d' }]}
                onPress={() => setShowBioModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={saveNewBio}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
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
    marginBottom: 12,
  },
    bio: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 6,
    fontStyle: 'italic',   // italic
    fontWeight: 'bold',    // bold
    color: '#333',         // darker for contrast
    //textShadowColor: 'rgba(0,0,0,0.3)', // shadow
    //textShadowOffset: { width: 1, height: 1 },
    //textShadowRadius: 2,
  },

  editBioButton: {
    marginTop:10,
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  editBioText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  gridLabel: {
    color: '#fff',
    fontSize: 13,
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
