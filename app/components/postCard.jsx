import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PostCard = ({ item, onDelete, isFirst }) => {
  const likeIcon = 'heart-outline';
  const likeColor = '#333';

  // ✅ Validate userImg (must be string URL) or fallback to local image
  const userImgSource =
    typeof item.userImg === 'string' && item.userImg.startsWith('http')
      ? { uri: item.userImg }
      : require('../../assets/back.png'); // adjust path if needed

  return (
    <View style={[styles.card, isFirst && styles.firstCard]}>
      <View style={styles.userInfo}>
        <Image source={userImgSource} style={styles.userImg} />
        <View>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.postTime}>
            {item.createdAt?.toDate?.().toLocaleString() ?? 'Just now'}
          </Text>
        </View>
      </View>

      <Text style={styles.postText}>{item.caption}</Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImg} />
      )}

      <View style={styles.interactionWrapper}>
        <TouchableOpacity style={styles.interaction}>
          <Ionicons name={likeIcon} size={20} color={likeColor} />
          <Text style={styles.interactionText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interaction}>
          <Ionicons name="chatbubble-outline" size={20} color="#333" />
          <Text style={styles.interactionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interaction} onPress={() => onDelete(item.id)}>
          <Ionicons name="trash" size={20} color="#333" />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
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
