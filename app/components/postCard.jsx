import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { auth } from '../../firebase/config';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ item, onDelete, isFirst }) => {
  const user = auth.currentUser;
  const userId = user?.uid;
  const isPostOwner = userId === item.userId;

  // Check if user already liked this post
  const alreadyLiked = item.likedBy?.includes(userId);
  const [liked, setLiked] = useState(alreadyLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);

  useEffect(() => {
    setLiked(item.likedBy?.includes(userId));
  }, [item.likedBy, userId]);

  const toggleLike = async () => {
    const postRef = doc(db, 'posts', item.id);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => prev + (newLiked ? 1 : -1));

    try {
      await updateDoc(postRef, {
        likeCount: increment(newLiked ? 1 : -1),
        likedBy: newLiked
          ? arrayUnion(userId)
          : arrayRemove(userId),
      });
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  const userImgSource =
    typeof item.userImg === 'string' && item.userImg.startsWith('http')
      ? { uri: item.userImg }
      : require('../../assets/back.png'); // fallback image

  return (
    <View style={[styles.card, isFirst && styles.firstCard]}>
      <View style={styles.userInfo}>
        <Image source={userImgSource} style={styles.userImg} />
        <View>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.postTime}>
            {item.createdAt?.toDate
              ? `${formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}`
              : 'Just now'}
          </Text>

        </View>
      </View>

      <Text style={styles.postText}>{item.caption}</Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImg} />
      )}

      <View style={styles.interactionWrapper}>
        <TouchableOpacity style={styles.interaction} onPress={toggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? 'red' : '#333'}
          />
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
    marginTop: 5,
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
    marginBottom: 10,
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
    marginLeft: 5,
    fontSize: 13,
  },
});

export default PostCard;
