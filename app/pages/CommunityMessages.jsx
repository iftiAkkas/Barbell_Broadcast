import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export default function CommunityMessages() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  const currentUser = auth.currentUser;
  const senderId = currentUser?.uid;
  const senderName = currentUser?.displayName || 'Me';
  const senderAvatar =
    currentUser?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}`;

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
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMe && <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />}
        <View
          style={[
            styles.messageContent,
            isMe ? styles.myBubble : styles.otherBubble,
          ]}
        >
          {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
          <Text style={{ color: isMe ? 'white' : 'black' }}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80} // adjust as needed
      >
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
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
  },
  sendButton: {
    backgroundColor: '#0a84ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
