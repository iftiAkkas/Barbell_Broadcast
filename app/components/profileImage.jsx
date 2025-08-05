import React, { useState, useCallback } from 'react';
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import app from '../../firebase/config';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileImage({ onPress, big }) {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProfileImage = async () => {
        try {
          const auth = getAuth(app);
          const user = auth.currentUser;
          if (!user) return;

          const db = getFirestore(app);
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && isActive) {
            const data = userDocSnap.data();
            if (data.profileImage) {
              setProfileImage(data.profileImage);
            } else {
              setProfileImage(null);
            }
          }
        } catch (error) {
          console.log('Error fetching profile image:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchProfileImage();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return <ActivityIndicator style={big ? styles.bigLoading : styles.loading} />;
  }

  return (
    <TouchableOpacity onPress={onPress} style={big ? styles.bigContainer : styles.container}>
      <Image
        source={
          profileImage
            ? { uri: profileImage }
            : require('../../assets/man.png') // default image
        }
        style={big ? styles.bigImage : styles.image}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 15,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 36,
  },
  bigContainer: {
    marginBottom: 20,
  },
  bigImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  loading: {
    marginLeft: 15,
  },
  bigLoading: {
    marginBottom: 20,
  },
});
