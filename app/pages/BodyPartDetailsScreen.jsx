import { Ionicons } from '@expo/vector-icons'; // ✅ Correct import for Expo
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import { fetchExercisesByBodyPart } from '../api/exerciseDB';
import ExerciseList from '../components/ExerciseList';
import { bodyParts } from '../constants';

export default function BodyPartDetailsScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState([]);
  const item = useLocalSearchParams();

  const selectedImage = bodyParts.find((part) => part.name === item.name)?.image;

  useEffect(() => {
    if (item?.name) {
      getExercisesByBodyPart(item.name);
    }
  }, [item]);

  const getExercisesByBodyPart = async (bodyPart) => {
    try {
      const data = await fetchExercisesByBodyPart(bodyPart);
        if (!data || data.length === 0) {
            console.warn(`No exercises found for body part: ${bodyPart}`);
            return;
        }
      setExercises(data);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <StatusBar style="light" />
      <Image source={selectedImage} style={styles.headerImage} />

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="caret-back-outline" size={hp(4)} color="white" />
      </TouchableOpacity>

      {/* exercises */}
      <View style={styles.exerciseTitleWrapper}>
        <Text style={styles.exerciseTitle}>
          {item.name} Exercises
        </Text>
      </View>
      <View style={styles.exerciseSpacer}>
        <ExerciseList data={exercises}/>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  headerImage: {
    width: wp(100),
    height: hp(45),
    resizeMode: 'cover',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButton: {
    backgroundColor: '#f43f5e', // rose-500
    position: 'absolute',
    top: hp(7),
    left: wp(5),
    height: hp(5.5),
    width: hp(5.5),
    borderRadius: hp(5.5) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitleWrapper: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
  },
  exerciseTitle: {
    fontSize: hp(3),
    fontWeight: '600',
    color: '#404040',
  },
  exerciseSpacer: {
    marginBottom: hp(10),
  },
});
