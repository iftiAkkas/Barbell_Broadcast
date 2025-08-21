import React, { useState, useEffect } from 'react';
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
  Keyboard,
  Animated,
} from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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

const AddPost = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [keyboardHeight] = useState(new Animated.Value(60)); // start at 60 px

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (e) => {
      Animated.timing(keyboardHeight, {
        duration: e.duration,
        toValue: e.endCoordinates.height + 40, // 40px above keyboard
        useNativeDriver: false,
      }).start();
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', (e) => {
      Animated.timing(keyboardHeight, {
        duration: e.duration,
        toValue: 60, // default 60px bottom margin
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardHeight]);

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
        aspect: [3, 4],
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
        aspect: [3, 4],
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
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
      </ScrollView>

      <Animated.View style={[styles.floatingAction, { bottom: keyboardHeight }]}>
        <FloatingAction
          actions={actions}
          color="#3b82f6"
          overlayColor="rgba(0, 0, 0, 0.5)"
          onPressItem={handleAction}
          distanceToEdge={{ vertical: 0, horizontal: 20 }}
          showBackground={false}
          iconWidth={26}
          iconHeight={26}
        />
      </Animated.View>
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
    fontSize: 35,
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
    aspectRatio: 3 / 4, // maintain 3:4 portrait ratio
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
    paddingVertical: 10,
    borderRadius: 10,
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
  floatingAction: {
    position: 'absolute',
    right: 20,
    marginBottom: 0,
  },
});
