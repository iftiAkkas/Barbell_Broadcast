import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
export default function BodyPartDetailsScreen() {
    const router = useRouter();
    const item = useLocalSearchParams();
    console.log(item);
    return(
        <View className="mt-20">
            <Text> Body Parts Details Screen</Text>
            <TouchableOpacity onPress={() => router.back()}>
                <Text>Go Back</Text>
            </TouchableOpacity>
        </View>
    )
}