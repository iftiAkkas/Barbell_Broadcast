import React, { useState } from 'react';
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
} from 'react-native';

const dummyMessages = [
  { id: '1', sender: 'me', text: 'Hey Alice!' },
  { id: '2', sender: 'other', text: 'Hey! How are you?' },
  { id: '3', sender: 'me', text: 'Doing great. You?' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(dummyMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: input,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'me' ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    marginTop: 35,
  },
  header: {
    height: 60,
    backgroundColor: '#4e6ef2',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    marginHorizontal: 10,
    borderRadius: 15,
    // Optional shadow for iOS:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Optional elevation for Android:
    elevation: 5,
  },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  messageList: {
    flexGrow: 1,
    padding: 12,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 60,
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4e6ef2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
