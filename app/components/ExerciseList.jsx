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
      activeOpacity={0.7}
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
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(10),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: wp(4),
    width: wp(44),
    // Shadows (android + ios)
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  name: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: '#222',
  },
  bodyPart: {
    marginTop: hp(0.5),
    fontSize: hp(1.6),
    color: '#555',
  },
  difficulty: {
    marginTop: hp(0.3),
    fontSize: hp(1.5),
    fontStyle: 'italic',
    color: '#888',
  },
});
