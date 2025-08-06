import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
} from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { db, auth } from '../../firebase/config';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ item, onDelete, onMessage, isFirst }) => {
  const user = auth.currentUser;
  const userId = user?.uid;
  const isPostOwner = userId === item.userId;

  const [liked, setLiked] = useState(item.likedBy?.includes(userId));
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const [modalVisible, setModalVisible] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState(item.userName || 'Unknown');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', item.userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const fullName = `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim();
          setUserName(fullName || item.userName || 'Unknown');
          setProfileImage(data.profileImage || null);
        } else {
          setUserName(item.userName || 'Unknown');
          setProfileImage(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserName(item.userName || 'Unknown');
        setProfileImage(null);
      }
    };

    fetchUserProfile();
  }, [item.userId, item.userName]);

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
        Alert.alert('Permission required', 'Please allow access to save the image.');
        return;
      }
      const fileUri = FileSystem.documentDirectory + imageUrl.split('/').pop();
      const downloaded = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(downloaded.uri);
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (err) {
      Alert.alert('Error', 'Could not save image.');
    }
  };

  const handleLongPressImage = () => {
    Alert.alert('Options', 'Choose an action', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save Image', onPress: () => saveImage(item.imageUrl) },
    ]);
  };

  const userImgSource =
    typeof profileImage === 'string' && profileImage.startsWith('http')
      ? { uri: profileImage }
      : require('../../assets/man.png');

  return (
    <View style={[styles.card, isFirst && styles.firstCard]}>
      {/* Show message button only if NOT post owner */}
      {!isPostOwner && (
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => {
            if (!userName || !profileImage) {
              Alert.alert('Please wait', 'Loading user info...');
              return;
            }
            onMessage?.(item.userId, userName, profileImage);
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <View style={styles.userInfo}>
        <Image source={userImgSource} style={styles.userImg} />
        <View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.postTime}>
            {item.createdAt?.toDate
              ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })
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
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.fullscreenImg}
                resizeMode="contain"
              />
            </Pressable>
          </Modal>
        </>
      )}

      <View style={styles.interactionWrapper}>
        <TouchableOpacity style={styles.likeInteraction} onPress={toggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={liked ? 'red' : '#3b82f6'}
          />
          <Text style={styles.interactionText}>{likeCount}</Text>
        </TouchableOpacity>

        {/* Show delete button only if post owner */}
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
    padding: 16,
    borderRadius: 14,
    borderColor: '#3b82f6',
    borderWidth: 2,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
    position: 'relative',
  },
  firstCard: {
    marginTop: 60,
  },
  messageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1e3a8a',
  },
  postTime: {
    color: '#6b7280',
    fontSize: 12,
  },
  postText: {
    marginVertical: 10,
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  postImg: {
    width: '100%',
    aspectRatio: 3 / 4,  // <-- Maintain 3:4 portrait aspect ratio here
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginBottom: 6,
  },
  interactionWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#889de3ff',
    marginTop: 10,
  },
  likeInteraction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interaction: {
    position: 'absolute',
    right: 10,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImg: {
    width: '100%',
    height: '100%',
  },
});

export default PostCard;
