import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db, auth } from '../../firebase/config';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const { userId, userName, profileImage } = useLocalSearchParams();
  const currentUser = auth.currentUser;

  if (!currentUser || !userId || !userName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  const chatId =
    currentUser.uid < userId
      ? `${currentUser.uid}_${userId}`
      : `${userId}_${currentUser.uid}`;

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);

      // 🔹 Mark unread messages as read
      const unread = snapshot.docs.filter(
        (doc) =>
          doc.data().receiverId === currentUser.uid && !doc.data().read
      );

      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach((doc) => {
          batch.update(doc.ref, { read: true });
        });
        await batch.commit();
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: input,
      senderId: currentUser.uid,
      receiverId: userId,
      createdAt: serverTimestamp(),
      read: false, // 🔹 new messages are unread by default
    });

    setInput('');
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const profileImageSource =
    typeof profileImage === 'string' && profileImage.startsWith('http')
      ? { uri: profileImage }
      : require('../../assets/man.png');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
      >
        <View style={styles.header}>
          <View style={styles.profileImageWrapper}>
            <Image source={profileImageSource} style={styles.profileImage} />
          </View>
          <Text style={styles.headerText}>{userName}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={styles.input}
            multiline={true}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={{ color: '#fff' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0d6efd',
    marginTop:15,
  },
  profileImageWrapper: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 2,
    marginRight: 10,
  },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  headerText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  messageList: { padding: 20 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '70%',
  },
  myMessage: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
});
