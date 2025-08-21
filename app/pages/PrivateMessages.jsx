import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  BackHandler,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultAvatar from "../../assets/man.png";

export default function PrivateMessages() {
  const [users, setUsers] = useState([]); // all users
  const [chattedUsers, setChattedUsers] = useState([]); // realtime list
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  const currentUserId = auth.currentUser?.uid;

  // 🔹 Handle back press (Android)
  useEffect(() => {
    const backAction = () => {
      if (searchMode) {
        setSearchMode(false);
        setSearchText("");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [searchMode]);

  // 🔹 Realtime load all users (FIXED)
  useEffect(() => {
    if (!currentUserId) return;

    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs
        .filter((doc) => doc.id !== currentUserId)
        .map((doc) => ({
          id: doc.id,
          userName: `${doc.data().firstName} ${doc.data().lastName}`,
          profileImage: doc.data().profileImage || null,
        }));
      setUsers(list);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUserId]);

  // 🔹 Realtime messages for each user
  useEffect(() => {
    if (!currentUserId || users.length === 0) return;
    const unsubscribers = [];

    users.forEach((u) => {
      const chatId =
        currentUserId < u.id
          ? `${currentUserId}_${u.id}`
          : `${u.id}_${currentUserId}`;

      const messagesRef = collection(db, "chats", chatId, "messages");
      const latestMsgQuery = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const unsub = onSnapshot(latestMsgQuery, (msgSnapshot) => {
        let latestMessage = "Tap to chat";
        let latestCreatedAt = 0;
        let isUnread = false;

        if (!msgSnapshot.empty) {
          const latest = msgSnapshot.docs[0].data();
          latestMessage = latest.text || "Media";
          latestCreatedAt = latest.createdAt?.toMillis?.() || Date.now();

          if (latest.senderId !== currentUserId && !latest.read) {
            isUnread = true;
          }
        }

        setChattedUsers((prev) => {
          const filtered = prev.filter((cu) => cu.id !== u.id);
          if (latestCreatedAt === 0) return filtered;
          return [
            ...filtered,
            {
              id: u.id,
              userName: u.userName,
              profileImage: u.profileImage, // 🔥 profile updates will reflect instantly
              latestMessage,
              latestCreatedAt,
              isUnread,
            },
          ].sort((a, b) => b.latestCreatedAt - a.latestCreatedAt);
        });
      });

      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [users, currentUserId]);

  // 🔹 Show chatted list OR search results
  const displayedUsers = searchMode
    ? users
        .filter((u) =>
          u.userName.toLowerCase().includes(searchText.toLowerCase())
        )
        .map((u) => {
          const chatted = chattedUsers.find((c) => c.id === u.id);
          return {
            ...u,
            latestMessage: chatted?.latestMessage || "Tap to chat",
            latestCreatedAt: chatted?.latestCreatedAt || 0,
            isUnread: chatted?.isUnread || false,
          };
        })
    : chattedUsers;

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatContainer}
      onPress={() =>
        router.push({
          pathname: "/screens/ChatScreen",
          params: {
            userId: item.id,
            userName: item.userName,
            profileImage: item.profileImage,
          },
        })
      }
    >
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.avatar} />
      ) : (
        <Image source={DefaultAvatar} style={styles.avatar} />
      )}

      <View style={styles.chatDetails}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text
          style={[
            styles.lastMessage,
            { color: item.isUnread ? "blue" : "black" },
          ]}
          numberOfLines={1}
        >
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
      {/* 🔹 Top Bar */}
      <View style={styles.topBar}>
        {searchMode ? (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSearchMode(false);
                setSearchText("");
              }}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </>
        ) : (
          <TouchableOpacity
            style={styles.searchToggle}
            onPress={() => setSearchMode(true)}
          >
            <Text style={styles.searchToggleText}>🔍 Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {displayedUsers.length === 0 ? (
        <View style={styles.noConversationContainer}>
          <Text style={styles.noConversationText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={displayedUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchToggle: { padding: 8 },
  searchToggleText: { fontSize: 16, fontWeight: "600" },
  backButton: { marginRight: 8 },
  backText: { fontSize: 20 },
  searchInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chatContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  chatDetails: { flex: 1 },
  userName: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  lastMessage: { fontSize: 14, fontWeight: "500" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noConversationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noConversationText: { fontSize: 16, color: "#666" },
});
