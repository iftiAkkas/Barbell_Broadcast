import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';

const dummyChats = [
  {
    id: '1',
    userName: 'Alice',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Hey, how are you?',
    timestamp: '2 min ago',
  },
  {
    id: '2',
    userName: 'Bob',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Let’s meet tomorrow!',
    timestamp: '5 min ago',
  },
];

export default function PrivateMessages() {
  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatContainer}
      onPress={() => {
        router.push({
          pathname: '/screens/ChatScreen',
          params: { userId: item.id, userName: item.userName },
        });
      }}
    >
      <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
      <View style={styles.chatDetails}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});
