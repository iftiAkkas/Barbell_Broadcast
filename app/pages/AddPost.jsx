import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FloatingAction } from 'react-native-floating-action';

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

const AddPost = () => {
  const [selectedImage, setSelectedImage] = useState(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Post</Text>

      {selectedImage && (
        <>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <Text style={styles.uriText}>{selectedImage}</Text>
        </>
      )}

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
