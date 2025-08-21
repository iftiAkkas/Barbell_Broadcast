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

export default function ProfileImage({ onPress }) {
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
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('../../assets/man.png')
          }
          style={styles.image}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    width: 50,
  },
  image: {
    width: 40,   // fixed size
    height: 40,
    borderRadius: 25,
    marginLeft:20 // circular
  },
  loading: {
    marginLeft: 15,
  },
});
