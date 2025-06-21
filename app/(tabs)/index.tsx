import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext'; // Adjust path if needed

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { translations, isDarkMode } = useLanguage();
  const trainAnim = useRef(new Animated.Value(width)).current;
  const sidebarAnim = useRef(new Animated.Value(width)).current;
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showSettingsButton, setShowSettingsButton] = useState(true);

  const themeColors = {
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    cardBackground: isDarkMode ? '#2d2d2d' : '#f8f8f8',
    accent: '#ff6600',
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(trainAnim, {
          toValue: -400,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(trainAnim, {
          toValue: width,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [trainAnim]);

  const toggleSidebar = (show?: boolean) => {
    const toValue = show ? width - 200 : width;
    const isVisible = show ?? !sidebarVisible;

    setShowSettingsButton(false);
    setSidebarVisible(isVisible);

    Animated.timing(sidebarAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false, // For 'left' property, useNativeDriver must be false
    }).start(() => {
      if (!isVisible) {
        setShowSettingsButton(true);
      }
    });
  };

  const handleOutsidePress = () => {
    if (sidebarVisible) {
      toggleSidebar(false);
    }
  };

  const handleSettingsPress = () => {
    Animated.timing(sidebarAnim, {
      toValue: width,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setSidebarVisible(false);
      setShowSettingsButton(true);
      router.push('/settings');
    });
  };

  const handleStationsMapPress = () => {
    Animated.timing(sidebarAnim, {
      toValue: width,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setSidebarVisible(false);
      setShowSettingsButton(true);
      router.push('/map');
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={themeColors.background}
        />
        <Image
          source={require('../../assets/images/favicon.png')} // Adjust path if needed
          style={styles.topLeftLogo}
          resizeMode="contain"
        />

        {showSettingsButton && (
          <TouchableOpacity
            onPress={() => toggleSidebar(true)}
            style={styles.settingsButton}
          >
            {/* This is already good as ☰ is inside a Text component */}
            <Text style={[styles.settingsIcon, { color: themeColors.text }]}>☰</Text>
          </TouchableOpacity>
        )}

        <Image
          source={require('../../assets/images/oncf.png')} // Adjust path if needed
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.separatorContainer}>
          <View style={[styles.separatorHalfBlack,
            { backgroundColor: isDarkMode ? '#ffffff' : '#000000' }]}
          />
          <View style={[styles.separatorHalfOrange, { backgroundColor: themeColors.accent }]} />
        </View>

        <Text style={[styles.title, { color: themeColors.text }]}>
          {translations.officeTitle}
        </Text>

        <Animated.Image
          source={require('../../assets/images/train.png')} // Adjust path if needed
          style={[styles.train, { transform: [{ translateX: trainAnim }] }]}
          resizeMode="contain"
        />

        <TouchableWithoutFeedback>
          <Animated.View style={[
            styles.sidebar,
            {
              left: sidebarAnim,
              backgroundColor: themeColors.cardBackground,
            }
          ]}>
            <Text style={[styles.sidebarMenuText, { color: themeColors.accent }]}>
              {translations.menuTitle}
            </Text>
            <View style={styles.menuSpacer} />

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => router.push('/two')}
            >
              {/* FIX APPLIED: Ensure emoji is explicitly treated as string within Text */}
              <Text style={styles.sidebarEmoji}>{'📷'}</Text>
              <Text style={[styles.sidebarText, { color: themeColors.text }]}>
                {translations.arVisualization}
              </Text>
            </TouchableOpacity>

            <View style={[styles.separatorLine,
              { backgroundColor: isDarkMode ? '#444' : '#ddd' }]}
            />

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={handleStationsMapPress}
            >
              {/* FIX APPLIED: Ensure emoji is explicitly treated as string within Text */}
              <Text style={styles.sidebarEmoji}>{'🗺️'}</Text>
              <Text style={[styles.sidebarText, { color: themeColors.text }]}>
                {translations.stationsMap}
              </Text>
            </TouchableOpacity>

            <View style={[styles.separatorLine,
              { backgroundColor: isDarkMode ? '#444' : '#ddd' }]}
            />

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={handleSettingsPress}
            >
              {/* FIX APPLIED: Ensure emoji is explicitly treated as string within Text */}
              <Text style={styles.sidebarEmoji}>{'⚙️'}</Text>
              <Text style={[styles.sidebarText, { color: themeColors.text }]}>
                {translations.settings}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 18,
    zIndex: 2,
  },
  settingsIcon: {
    fontSize: 35,
    top: 11,
  },
  logo: {
    width: 200,
    height: 200,
    marginRight: 50,
    marginBottom: -10,
    marginTop: 160,
    alignSelf: 'center',
  },
  topLeftLogo: {
    position: 'absolute',
    top: 50,
    left: 13,
    width: 75,
    height: 75,
    zIndex: 2,
  },
  separatorContainer: {
    width: 150,
    height: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 1,
    alignSelf: 'center',
    marginBottom: 20,
  },
  separatorHalfBlack: {
    flex: 1,
  },
  separatorHalfOrange: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  train: {
    width: 500,
    height: 180,
    position: 'absolute',
    bottom: 100,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    width: 200,
    height: height,
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  sidebarMenuText: {
    position: 'absolute',
    top: 60,
    left: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuSpacer: {
    height: 45,
  },
  separatorLine: {
    height: 1,
    marginVertical: 15,
    marginHorizontal: 5,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  sidebarText: {
    fontSize: 18,
  },
});