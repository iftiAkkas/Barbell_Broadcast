import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { db } from '../../firebase/config'; // adjust path if needed
import PostCard from '../components/postCard';

const SocialHomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);  // Loading state added

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(allPosts);
      setLoading(false);  // Data loaded, stop loading
    }, (error) => {
      console.log('Error fetching posts:', error);
      setLoading(false);  // Even on error, stop loading
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (err) {
      console.log('Error deleting post:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item}) => (
          <PostCard item={item} onDelete={handleDelete} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    marginBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SocialHomeScreen;
