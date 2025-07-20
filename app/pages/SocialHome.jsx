// HomeScreen.js
import React, { useState, useLayoutEffect  } from 'react';
import { View, FlatList, SafeAreaView, Alert } from 'react-native';
import PostCard from '../components/postCard';
import { useNavigation } from '@react-navigation/native';

const dummyPosts = [
    {
        id: '1',
        userName: 'Jenny Doe',
        userImg: require('../../assets/chest.png'),
        postTime: '4 mins ago',
        post: 'Just testing the social platform UI!',
        postImg: require('../../assets/chest.png'),
        liked: true,
        likes: 14,
        comments: 5,
    },
    {
        id: '2',
        userName: 'John Doe',
        userImg: require('../../assets/back.png'),
        postTime: '2 hours ago',
        post: 'Post without an image.',
        postImg: 'none',
        liked: false,
        likes: 8,
        comments: 0,
    },
];

const SocialHomeScreen = () => {

    const navigation = useNavigation();

    useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false, // ✅ this overrides parent back
    });
  }, [navigation]);

    const [posts, setPosts] = useState(dummyPosts);

    const handleDelete = (postId) => {
        Alert.alert('Delete post', 'Are you sure?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: () => {
                    setPosts((prev) => prev.filter((item) => item.id !== postId));
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <PostCard item={item} onDelete={handleDelete} isFirst={index === 0} />
                )}
                showsVerticalScrollIndicator={false}
            />

        </SafeAreaView>
    );
};

export default SocialHomeScreen;
