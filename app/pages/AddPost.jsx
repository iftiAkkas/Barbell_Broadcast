import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert,TextInput, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FloatingAction } from 'react-native-floating-action';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../firebase/config';

const actions = [
  {
    text: 'Camera',
    icon: require('../../assets/camera.png'),
    name: 'camera',
    position: 2,
  },
  {
    text: 'Choose Photo',
    icon: require('../../assets/gallery.png'),
    name: 'gallery',
    position: 1,
  },
];

const uploadImageToCloudinary = async (uri) => {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  });
  data.append('upload_preset', 'barbellblabla'); // <-- replace this
  data.append('cloud_name', 'dumsmhrum'); // <-- replace this

  const response = await fetch('https://api.cloudinary.com/v1_1/dumsmhrum/image/upload', {
    method: 'POST',
    body: data,
  });

  const result = await response.json();
  return result.secure_url; // This is the hosted image URL
};

const AddPost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');

  const handleAction = async (name) => {
    let result;

    if (name === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera access is needed to take a photo.');
        return;
      }

      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (name === 'gallery') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Gallery access is needed to select a photo.');
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      console.log('Image URI:', imageUri);
      setSelectedImage(imageUri);
    }
  };

  const handlePost = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Not logged in', 'You must be logged in to post.');
        return;
      }

      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadImageToCloudinary(selectedImage);

      }

      const postObj = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        caption,
        imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'posts'), postObj);
      Alert.alert('Success', 'Post uploaded!');
      setCaption('');
      setSelectedImage(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while posting.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Post</Text>

      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        multiline
        value={caption}
        onChangeText={setCaption}
      />

      {selectedImage && (
        <>
          <Image source={{ uri: selectedImage }} style={styles.image} />
        </>
      )}

      <Button title="Post" onPress={handlePost} />

      <FloatingAction
        actions={actions}
        color="#e74c3c"
        overlayColor="rgba(0, 0, 0, 0.5)"
        onPressItem={handleAction}
      />
    </View>
  );
};

export default AddPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  uriText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  },
});
