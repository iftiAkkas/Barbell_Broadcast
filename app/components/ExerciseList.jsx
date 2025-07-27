import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

export default function ExerciseList({ data }) {
  const router = useRouter();

  const onPressExercise = (item) => {
    router.push({
      pathname: '/pages/ExerciseDetailsScreen',
      params: item,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPressExercise(item)}
    >
      <Text style={styles.name}>{capitalize(item.name)}</Text>
      <Text style={styles.bodyPart}>{capitalize(item.bodyPart)}</Text>
      <Text style={styles.difficulty}>{capitalize(item.difficulty)}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(8),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  card: {
    backgroundColor: '#ffe6cc',
    borderRadius: 16,
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    width: wp(42),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  name: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#222',
    marginBottom: hp(0.5),
  },
  bodyPart: {
    fontSize: hp(1.5),
    color: '#444',
    marginBottom: hp(0.3),
  },
  difficulty: {
    fontSize: hp(1.4),
    color: '#777',
    fontStyle: 'italic',
  },
});
