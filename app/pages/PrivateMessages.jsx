import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ Important

export default function PrivateMessages() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsersWithLatestMessages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const fetchedUsers = [];

        for (const doc of querySnapshot.docs) {
          if (doc.id !== currentUserId) {
            const userData = doc.data();
            const userName = `${userData.firstName} ${userData.lastName}`;
            const chatId =
              currentUserId < doc.id
                ? `${currentUserId}_${doc.id}`
                : `${doc.id}_${currentUserId}`;

            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const latestMsgQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
            const msgSnapshot = await getDocs(latestMsgQuery);

            let latestMessage = 'Tap to chat';
            if (!msgSnapshot.empty) {
              const latest = msgSnapshot.docs[0].data();
              latestMessage = latest.text || 'Media';
            }

            fetchedUsers.push({
              id: doc.id,
              userName,
              userAvatar: null,
              latestMessage,
            });
          }
        }

        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users or messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithLatestMessages();
  }, []);

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
      <Image
        source={{
          uri:
            item.userAvatar ||
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.userName),
        }}
        style={styles.avatar}
      />
      <View style={styles.chatDetails}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.latestMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={{ padding: 12 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
     // Adjusted to prevent overlap with the tab bar
  },
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
    //marginBottom: 20,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
