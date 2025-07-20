import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import { fetchExercisesByBodyPart } from '../api/exerciseDB';
import { bodyParts, demoExercises } from '../constants';

export default function BodyPartDetailsScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState(demoExercises);
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
      setExercises(data);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <StatusBar style="light" />
      <Image source={selectedImage} style={styles.headerImage} />
      <View style={styles.content}>
        <Text style={styles.heading}>Exercises for {item.name}</Text>
        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseTarget}>Target: {exercise.target}</Text>
          </View>
        ))}
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
  },
  content: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  heading: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(2),
  },
  exerciseCard: {
    backgroundColor: '#f0f0f0',
    padding: wp(4),
    borderRadius: 12,
    marginBottom: hp(2),
  },
  exerciseName: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: '#222',
  },
  exerciseTarget: {
    fontSize: hp(1.8),
    color: '#555',
    marginTop: 4,
  },
});
