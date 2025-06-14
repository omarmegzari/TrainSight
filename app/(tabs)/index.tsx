import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const trainAnim = useRef(new Animated.Value(width)).current; // commence à droite

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(trainAnim, {
          toValue: -400, // va complètement à gauche
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(trainAnim, {
          toValue: width, // revient à droite instantanément
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [trainAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Logo ONCF */}
      <Image
        source={require('../../assets/images/oncf.png')} // adapte le chemin si besoin
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.separatorContainer}>
        <View style={styles.separatorHalfBlack} />
        <View style={styles.separatorHalfOrange} />
      </View>
      {/* Titre */}
      <Text style={styles.title}>Office National des Chemins de Fer</Text>

      {/* Image animée du train */}
      <Animated.Image
        source={require('../../assets/images/train.png')}
        style={[styles.train, { transform: [{ translateX: trainAnim }] }]}
        resizeMode="contain"
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginRight: 50,
    marginBottom: -10,
    marginTop: -80,
  },
  separatorContainer: {
    width: 150,
    height: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 1,
    marginBottom: 20,
  },
  separatorHalfBlack: {
    flex: 1,
    backgroundColor: 'black',
  },
  separatorHalfOrange: {
    flex: 1,
    backgroundColor: '#ff6600',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 40,
  },
  train: {
    width: 500,
    height: 180,
    position: 'absolute',
    bottom: 100,
  },
});
