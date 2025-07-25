import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Modal, Alert, Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { db, auth } from '../../firebase/config';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ item, onDelete, isFirst }) => {
  const user = auth.currentUser;
  const userId = user?.uid;
  const isPostOwner = userId === item.userId;

  const [liked, setLiked] = useState(item.likedBy?.includes(userId));
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState(item.userName); // fallback

  // Fetch profile image from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', item.userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileImage(data.profileImage || null);
          if (data.name) setUserName(data.name);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [item.userId]);

  useEffect(() => {
    setLiked(item.likedBy?.includes(userId));
  }, [item.likedBy]);

  const toggleLike = async () => {
    const postRef = doc(db, 'posts', item.id);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));

    try {
      await updateDoc(postRef, {
        likeCount: increment(newLiked ? 1 : -1),
        likedBy: newLiked ? arrayUnion(userId) : arrayRemove(userId),
      });
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  const saveImage = async (imageUrl) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Allow access to save image');
        return;
      }

      const fileUri = FileSystem.documentDirectory + imageUrl.split('/').pop();
      const downloaded = await FileSystem.downloadAsync(imageUrl, fileUri);

      await MediaLibrary.saveToLibraryAsync(downloaded.uri);
      Alert.alert('Saved', 'Image saved to gallery!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleLongPressImage = () => {
    Alert.alert(
      'Image Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save Image', onPress: () => saveImage(item.imageUrl) },
      ],
      { cancelable: true }
    );
  };

  const userImgSource =
    typeof profileImage === 'string' && profileImage.startsWith('http')
      ? { uri: profileImage }
      : require('../../assets/man.png'); // fallback image

  return (
    <View style={[styles.card, isFirst && styles.firstCard]}>
      <View style={styles.userInfo}>
        <Image source={userImgSource} style={styles.userImg} />
        <View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.postTime}>
            {item.createdAt?.toDate
              ? `${formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}`
              : 'Just now'}
          </Text>
        </View>
      </View>

      <Text style={styles.postText}>{item.caption}</Text>

      {item.imageUrl && (
        <>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            onLongPress={handleLongPressImage}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.postImg} />
          </TouchableOpacity>

          <Modal visible={modalVisible} transparent animationType="fade">
            <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
              <Image source={{ uri: item.imageUrl }} style={styles.fullscreenImg} resizeMode="contain" />
            </Pressable>
          </Modal>
        </>
      )}

      <View style={styles.interactionWrapper}>
        <TouchableOpacity style={styles.interaction} onPress={toggleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? 'red' : '#333'} />
          <Text style={styles.interactionText}>{likeCount}</Text>
        </TouchableOpacity>

        {isPostOwner && (
          <TouchableOpacity style={styles.interaction} onPress={() => onDelete(item.id)}>
            <Ionicons name="trash" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  firstCard: {
    marginTop: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
  postTime: {
    color: '#777',
    fontSize: 12,
  },
  postText: {
    marginVertical: 10,
    fontSize: 14,
  },
  postImg: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 2,
  },
  interactionWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  interaction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    marginLeft: 3,
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImg: {
    width: '100%',
    height: '100%',
  },
});

export default PostCard;
