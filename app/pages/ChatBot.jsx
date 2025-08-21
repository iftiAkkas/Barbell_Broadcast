import axios from 'axios';
import { 
  addDoc, 
  collection, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
  Image,
} from 'react-native';
import { db, auth } from '../../firebase/config'; 
import { geminiApiKey } from '../constants';
import { doc, getDoc } from 'firebase/firestore';

// --- fetch profile image helper
const getUserProfileImage = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return data.profileImage || null;
    }
    return null;
  } catch (error) {
    console.log("Error fetching profile image:", error);
    return null;
  }
};

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const chatId = `bot_${currentUser.uid}`;

  // Save message to Firestore
  const saveMessageToFirestore = async (message) => {
    try {
      await addDoc(collection(db, 'chatMessages', chatId, 'messages'), {
        sender: message.sender,
        userId: currentUser.uid,
        text: message.text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving message to Firestore:', error);
    }
  };

  // Fetch messages in real-time + attach profileImage
  useEffect(() => {
    const q = query(
      collection(db, 'chatMessages', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let profileImage = null;

          if (data.sender === "user") {
            profileImage = await getUserProfileImage(data.userId);
          } else {
            // bot default avatar
            profileImage = Image.resolveAssetSource(require("../../assets/bot2.png")).uri;
          }

          return {
            id: docSnap.id,
            ...data,
            profileImage,
          };
        })
      );
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    saveMessageToFirestore(userMessage);

    setInput('');

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{ parts: [{ text: userMessage.text }] }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiApiKey,
          },
        }
      );

      const botReply =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No response from the bot.';

      const botMessage = { sender: 'bot', text: botReply };
      setMessages((prev) => [...prev, botMessage]);
      saveMessageToFirestore(botMessage);
    } catch (error) {
      console.error('Error communicating with API:', error);
      const errorMessage = {
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      saveMessageToFirestore(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.chatContainer}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageRow,
                message.sender === 'user'
                  ? styles.userRow
                  : styles.botRow,
              ]}
            >
              {message.sender === 'bot' && message.profileImage && (
                <Image source={{ uri: message.profileImage }} style={styles.avatar} />
              )}
              <View
                style={[
                  styles.message,
                  message.sender === 'user'
                    ? styles.userMessage
                    : styles.botMessage,
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
              {message.sender === 'user' && message.profileImage && (
                <Image source={{ uri: message.profileImage }} style={styles.avatar} />
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, paddingHorizontal: 10, backgroundColor: '#f5f5f5' },
  chatContainer: { flex: 1, marginBottom: 10,marginTop: 50 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 5 },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 5 },
  message: {
    padding: 10,
    borderRadius: 8,
    maxWidth: '70%',
  },
  userMessage: { backgroundColor: '#d1e7dd' },
  botMessage: { backgroundColor: '#e5e5ea' },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingBottom: 5 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
});
