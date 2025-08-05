import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import { auth, db } from '../../firebase/config';

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
  data.append('upload_preset', 'barbellblabla');
  data.append('cloud_name', 'dumsmhrum');

  const response = await fetch('https://api.cloudinary.com/v1_1/dumsmhrum/image/upload', {
    method: 'POST',
    body: data,
  });

  const result = await response.json();
  return result.secure_url;
};

const AddPost = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);

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
      setSelectedImage(imageUri);
    }
  };

  const handlePost = async () => {
    try {
      setIsPosting(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Not logged in', 'You must be logged in to post.');
        setIsPosting(false);
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
        likeCount: 0,
        likedBy: [],
      };

      await addDoc(collection(db, 'posts'), postObj);
      Alert.alert('Success', 'Post uploaded!');
      setCaption('');
      setSelectedImage(null);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while posting.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Post</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          multiline
          value={caption}
          onChangeText={setCaption}
          placeholderTextColor="#999"
          maxLength={300}
        />

        {selectedImage && (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        {isPosting ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        )}

        <FloatingAction
          actions={actions}
          color="#3b82f6"
          overlayColor="rgba(0, 0, 0, 0.5)"
          onPressItem={handleAction}
          distanceToEdge={{ vertical: 90, horizontal: 20 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddPost;

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 270,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
    position: 'relative',
    height: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  backButtonText: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
    marginBottom: 20,
    color: '#333',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  removeImageText: {
    color: 'white',
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  loadingButton: {
    backgroundColor: '#a5b4fc',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
});
