import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../firebase/config';

// Import local image as fallback
import DefaultAvatar from '../../assets/man.png';

export default function CommunityMessages() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [usersMap, setUsersMap] = useState({});
  const flatListRef = useRef(null);

  const currentUser = auth.currentUser;
  const senderId = currentUser?.uid;

  // Fetch all user data into a userId => { fullName, profileImage } map
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const map = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          const fullName = `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim();
          map[doc.id] = {
            fullName: fullName || 'Unknown',
            avatar: data.profileImage || null,
          };
        });
        setUsersMap(map);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Listen to community chat messages
  useEffect(() => {
    const q = query(collection(db, 'communityChats'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Use usersMap to get senderName and avatar
    const senderInfo = usersMap[senderId] || {};
    const senderName = senderInfo.fullName || 'Me';
    const senderAvatar = senderInfo.avatar || null;

    await addDoc(collection(db, 'communityChats'), {
      text: input,
      senderId,
      senderName,
      senderAvatar,
      createdAt: serverTimestamp(),
    });

    setInput('');
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === senderId;

    const userInfo = usersMap[item.senderId] || {};
    const displayName = isMe
      ? usersMap[senderId]?.fullName || 'Me'
      : userInfo.fullName || item.senderName || 'Unknown';

    const displayAvatar =
      userInfo.avatar || item.senderAvatar || DefaultAvatar;

    const avatarSource =
      typeof displayAvatar === 'string'
        ? { uri: displayAvatar }
        : displayAvatar;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMe && <Image source={avatarSource} style={styles.avatar} />}
        <View
          style={[
            styles.messageContent,
            isMe ? styles.myBubble : styles.otherBubble,
          ]}
        >
          {!isMe && <Text style={styles.senderName}>{displayName}</Text>}
          <Text style={{ color: isMe ? 'white' : 'black' }}>{item.text}</Text>
        </View>
        {isMe && <Image source={avatarSource} style={styles.avatar} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 80}
      >
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12, paddingBottom: 0 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          />
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type a message..."
              style={styles.input}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  keyboardAvoid: { flex: 1 },
  container: {
    flex: 1,
    marginBottom: 70,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  messageContent: {
    maxWidth: '70%',
    borderRadius: 12,
    padding: 10,
  },
  myBubble: {
    backgroundColor: '#0a84ff',
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 0,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#f9f9f9',
    
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    maxHeight: 100,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#0a84ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});
