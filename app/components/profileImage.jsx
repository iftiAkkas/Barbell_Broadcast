import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import app from '../../firebase/config';

export default function ProfileImage({ onPress, big }) {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchUserData = async () => {
        try {
          const auth = getAuth(app);
          const user = auth.currentUser;
          if (!user) return;

          const db = getFirestore(app);
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && isActive) {
            const data = userDocSnap.data();
            setProfileImage(data.profileImage || null);
          }
        } catch (error) {
          console.log('Error fetching user data:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchUserData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <ActivityIndicator style={big ? styles.bigLoading : styles.loading} />
    );
  }

  return (
    <View style={big ? styles.bigWrapper : styles.wrapper}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('../../assets/man.png')
          }
          style={big ? styles.bigImage : styles.image}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: 150,
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
    width: 200,
  },
  bigWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    height: 200,
    width: 200,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 36,
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
