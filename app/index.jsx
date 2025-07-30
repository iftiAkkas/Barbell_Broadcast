import { useRouter } from "expo-router";
import React, { useRef, useEffect } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { LinearGradient } from 'expo-linear-gradient';
import { vi } from "date-fns/locale";


export default function Page() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [scaleAnim]);

  return (
    // <ImageBackground
    //   source={require('../assets/fitness2.jpg')} // Replace with your cartoon bg image
    //   style={styles.background}
    //   resizeMode="cover"
    //   blurRadius={4}
    // >

//     <LinearGradient
//   colors={['#007aff', '#a6d3fbff']}
//   style={styles.background}
// >



     <View style={[styles.background, { backgroundColor: "#0066ee" }]}>

      <View style={styles.overlay}>
       
          <Text style={styles.heading}>Barbell <Text style={styles.highlight}>Broadcast</Text></Text>


        <Text style={styles.subtitle}>
         Your gains deserve better than Notes app logs.
        </Text>


        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    {/* </ImageBackground> */}
    {/* </LinearGradient> */}


         <Image
  source={require('../assets/mock.png')}
  style={styles.mockImage}
/>

    
    </View>
    
  );
}

const styles = StyleSheet.create({


  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 32,
  paddingHorizontal: '30%', 
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
button: {
  backgroundColor: '#ffffff',
  paddingVertical: 16,
  paddingHorizontal: 36,
  borderRadius: 999, // full pill shape
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 4,
  marginTop: 10,
},

buttonText: {
  color: '#0066ee', // or '#007aff' based on your brand
  fontSize: 16,
  fontWeight: 'bold',
},

  heading: {
  fontSize: 58,
  fontWeight: 'bold',
  color: '#fff',
  textAlign: 'center',
  marginBottom: 18,
  lineHeight: 44,
},

highlight: {
  backgroundColor: '#ffffff',
  color: '#007aff', // or your new brand blue
  paddingHorizontal: 4,
  borderRadius: 4,
},

subtitle: {
  fontSize: 20,
  color: '#ffffff',
  textAlign: 'center',
  marginBottom: 10,
  paddingHorizontal: 20,
  opacity: 0.85,
  marginTop: 8,
},


mockImage: {
  width: 220,
  height: 450,
  resizeMode: 'contain',
  marginTop: 30,
},

});
