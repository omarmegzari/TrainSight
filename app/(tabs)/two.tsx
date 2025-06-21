import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Image,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';
import { useLanguage, LanguageCode } from '../../src/context/LanguageContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

const CAMERA_FOV_HORIZONTAL = 60;
const CAMERA_FOV_VERTICAL = 45;
const MAX_DISPLAY_DISTANCE = 500;
const DEVICE_MOTION_UPDATE_INTERVAL = 100;
const LOCATION_UPDATE_INTERVAL = 1000;

interface TranslatableText {
  fr: string;
  en: string;
  ar: string;
}

interface StationPoint {
  id: string;
  name: TranslatableText;
  coordinates: { latitude: number; longitude: number };
  icon: string;
  description: TranslatableText;
  image: any;
}

const STATION_POINTS: StationPoint[] = [
  {
    id: 'entrance',
    name: {
      fr: 'Entrée de la gare',
      en: 'Station Entrance',
      ar: 'مدخل المحطة',
    },
    coordinates: { latitude: 34.0470819, longitude: -5.0051884 },
    icon: '🏛️',
    description: {
      fr: 'Entrée principale de la gare',
      en: 'Main entrance of the station',
      ar: 'المدخل الرئيسي للمحطة',
    },
    image: require('../../assets/images/gare1.png'),
  },
  {
    id: 'ticket',
    name: {
      fr: 'Billetterie',
      en: 'Ticket Office',
      ar: 'شباك التذاكر',
    },
    coordinates: { latitude: 34.047263, longitude: -5.0049376 },
    icon: '🎫',
    description: {
      fr: 'Achat des billets',
      en: 'Purchase tickets',
      ar: 'شراء التذاكر',
    },
    image: require('../../assets/images/gare20.png'),
  },
  {
    id: 'RS',
    name: {
      fr: 'Rail Shop',
      en: 'Rail Shop',
      ar: 'متجر القطار',
    },
    coordinates: { latitude: 34.0473483, longitude: -5.0056002 },
    icon: '🛍️',
    description: {
      fr: 'Journaux Cadeaux Gadgets',
      en: 'Newspapers Gifts Gadgets',
      ar: 'جرائد هدايا أدوات',
    },
    image: require('../../assets/images/gare11.png'),
  },
  {
    id: 'access',
    name: {
      fr: 'Accès voie',
      en: 'Track Access',
      ar: 'الوصول إلى المسار',
    },
    coordinates: { latitude: 34.0474083, longitude: -5.005455 },
    icon: '🚆',
    description: {
      fr: 'Accès aux quais',
      en: 'Access to platforms',
      ar: 'الوصول إلى الأرصفة',
    },
    image: require('../../assets/images/gare16.png'),
  },
  {
    id: 'inwi',
    name: {
      fr: 'Agence INWI',
      en: 'INWI Agency',
      ar: 'وكالة إنوي',
    },
    coordinates: { latitude: 34.0470166, longitude: -5.0055264 },
    icon: '📱',
    description: {
      fr: 'Boutique de téléphonie',
      en: 'Phone shop',
      ar: 'متجر الهواتف',
    },
    image: require('../../assets/images/gare7.png'),
  },
  {
    id: 'venicia',
    name: {
      fr: 'Venicia Ice',
      en: 'Venicia Ice',
      ar: 'فينيسيا آيس',
    },
    coordinates: { latitude: 34.0471572, longitude: -5.0055918 },
    icon: '🍦',
    description: {
      fr: 'Café et glaces',
      en: 'Coffee and ice cream',
      ar: 'قهوة وآيس كريم',
    },
    image: require('../../assets/images/gare8.png'),
  },
  {
    id: 'toilet',
    name: {
      fr: 'Toilettes',
      en: 'Restrooms',
      ar: 'مراحيض',
    },
    coordinates: { latitude: 34.0475047, longitude: -5.0050466 },
    icon: '🚻',
    description: {
      fr: 'Sanitaires publics',
      en: 'Public restrooms',
      ar: 'حمامات عامة',
    },
    image: require('../../assets/images/gare16.png'),
  },
  {
    id: 'cafes',
    name: {
      fr: 'Les Cafés Picasso',
      en: 'Picasso Cafes',
      ar: 'مقاهي بيكاسو',
    },
    coordinates: { latitude: 34.0471183, longitude: -5.005576 },
    icon: '☕',
    description: {
      fr: "L'art du café depuis 1993",
      en: "The art of coffee since 1993",
      ar: 'فن القهوة منذ عام 1993',
    },
    image: require('../../assets/images/gare12.png'),
  },
  {
    id: 'sales',
    name: {
      fr: 'Vente-Conseil',
      en: 'Sales & Advice',
      ar: 'البيع والاستشارة',
    },
    coordinates: { latitude: 34.0474244, longitude: -5.0050141 },
    icon: '💬',
    description: {
      fr: 'Service client et conseils',
      en: 'Customer service and advice',
      ar: 'خدمة العملاء والاستشارات',
    },
    image: require('../../assets/images/gare13.png'),
  },
];

const LANGUAGE_VIDEOS: { [key in LanguageCode]: any } = {
  fr: require('../../assets/videos/noraFR.mp4'),
  en: require('../../assets/videos/noraEN.mp4'),
  ar: require('../../assets/videos/noraAR.mp4'),
};

export default function ARScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<StationPoint | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [devicePitch, setDevicePitch] = useState<number>(0);
  const [deviceRoll, setDeviceRoll] = useState<number>(0);
  const { translations, isDarkMode, currentLanguage, isRTL } = useLanguage();
  const router = useRouter();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);

  const panelAnim = useRef(new Animated.Value(0)).current;
  const dockAnim = useRef(new Animated.Value(0)).current;

  const [showIntroVideo, setShowIntroVideo] = useState(true);

  const themeColors = useMemo(() => ({
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    accent: '#ff6600',
    card: isDarkMode ? '#2d2d2d' : '#ffffff',
  }), [isDarkMode]);

  const getDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRadians = (deg: number) => deg * Math.PI / 180;
    const R = 6371e3;
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const getBearing = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRadians = (deg: number) => deg * Math.PI / 180;
    const toDegrees = (rad: number) => rad * 180 / Math.PI;

    const φ1 = toRadians(lat1);
    const λ1 = toRadians(lon1);
    const φ2 = toRadians(lat2);
    const λ2 = toRadians(lon2);

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    let bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;
  }, []);

  const getRelativePositionOnScreen = useCallback(
    (poi: StationPoint, currentLocation: Location.LocationObject | null) => {
      if (!currentLocation) return null;

      const { latitude: lat1, longitude: lon1 } = currentLocation.coords;
      const { latitude: lat2, longitude: lon2 } = poi.coordinates;

      let bearingToPOI = getBearing(lat1, lon1, lat2, lon2);
      let horizontalAngleDiff = bearingToPOI - heading;

      horizontalAngleDiff = ((horizontalAngleDiff + 180) % 360) - 180;

      const verticalAngleFromHorizon = 0;
      const verticalAngleDiff = verticalAngleFromHorizon - devicePitch;

      const isInHorizontalFOV = Math.abs(horizontalAngleDiff) <= CAMERA_FOV_HORIZONTAL / 2;
      const isInVerticalFOV = Math.abs(verticalAngleDiff) <= CAMERA_FOV_VERTICAL / 2;
      if (!isInHorizontalFOV || !isInVerticalFOV) return null;

      const x = (width / 2) + (horizontalAngleDiff / CAMERA_FOV_HORIZONTAL) * width;
      const y = (height / 2) - (verticalAngleDiff / CAMERA_FOV_VERTICAL) * height;

      const distance = getDistance(lat1, lon1, lat2, lon2);
      return { x, y, distance };
    },
    [heading, devicePitch, getBearing, getDistance]
  );

  const requestAndWatchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);

      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return () => {};
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      const locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: 1,
        },
        (loc) => setLocation(loc)
      );

      const headingSubscription = await Location.watchHeadingAsync((h) => {
        setHeading(h.trueHeading !== -1 ? h.trueHeading : h.magHeading);
      });

      return () => {
        locationWatcher.remove();
        headingSubscription.remove();
      };
    } catch (error) {
      console.error('Location error:', error);
      return () => {};
    }
  }, []);

  useEffect(() => {
    if (!isFocused) return;

    let cleanupLocation: (() => void) | undefined;
    let deviceMotionSubscription: { remove: () => void } | undefined;

    if (!showIntroVideo) {
      const setupAR = async () => {
        try {
          if (!cameraPermission?.granted) {
            await requestCameraPermission();
          }

          cleanupLocation = await requestAndWatchLocation();

          DeviceMotion.setUpdateInterval(DEVICE_MOTION_UPDATE_INTERVAL);
          deviceMotionSubscription = DeviceMotion.addListener((data) => {
            if (data.rotation) {
              setDevicePitch(data.rotation.beta * (180 / Math.PI));
              setDeviceRoll(data.rotation.gamma * (180 / Math.PI));
            }
          });

          if (cameraPermission?.granted) {
            Animated.timing(dockAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }
        } catch (error) {
          console.error('AR setup error:', error);
        }
      };

      setupAR();
    }

    return () => {
      cleanupLocation?.();
      deviceMotionSubscription?.remove();
      DeviceMotion.removeAllListeners();
    };
  }, [isFocused, cameraPermission, requestCameraPermission, requestAndWatchLocation, dockAnim, showIntroVideo]);

  useEffect(() => {
    // Reset to show video when screen is focused
    if (isFocused) {
      setShowIntroVideo(true);
    }
  }, [isFocused]);

  useEffect(() => {
    Animated.timing(panelAnim, {
      toValue: selectedPoint ? 1 : 0,
      duration: selectedPoint ? 300 : 200,
      useNativeDriver: true,
    }).start();
  }, [selectedPoint, panelAnim]);

  const handleGrantPermissions = async () => {
    try {
      const [cameraResult, locationResult] = await Promise.all([
        requestCameraPermission(),
        Location.requestForegroundPermissionsAsync(),
      ]);

      setLocationPermissionStatus(locationResult.status);

      if (!cameraResult.granted || locationResult.status !== 'granted') {
        Alert.alert(
          translations?.permissionsDeniedTitle || 'Permissions Required',
          translations?.permissionsDeniedMessage ||
          'Please grant Camera and Location permissions to use AR features.',
          [
            { text: 'OK', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const hasAllPermissions = cameraPermission?.granted && locationPermissionStatus === 'granted';

  const renderedARPoints = useMemo(() => {
    if (!location) return null;

    return STATION_POINTS.map((point) => {
      const screenPosition = getRelativePositionOnScreen(point, location);
      if (!screenPosition || screenPosition.distance > MAX_DISPLAY_DISTANCE) return null;

      const scale = Math.max(0.4, 1 - screenPosition.distance / MAX_DISPLAY_DISTANCE);
      const iconSize = 36 * scale;

      return (
        <TouchableOpacity
          key={point.id}
          style={[
            styles.arPointContainer,
            {
              left: screenPosition.x - iconSize / 2,
              top: screenPosition.y - iconSize / 2 - 30,
              transform: [{ scale }],
              opacity: scale,
            },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedPoint(point);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.arPointHalo} />
          <Text style={[styles.arPointIcon, { fontSize: iconSize }]}>
            {point.icon}
          </Text>
          <Text
            style={[
              styles.arPointText,
              isRTL && { textAlign: 'right' },
            ]}
            numberOfLines={1}
          >
            {point.name[currentLanguage] || point.name.en}
          </Text>
          <Text
            style={[
              styles.arPointDistance,
              isRTL && { textAlign: 'right' },
            ]}
          >
            {screenPosition.distance >= 1000
              ? `${(screenPosition.distance / 1000).toFixed(1)} km`
              : `${Math.round(screenPosition.distance)} m`}
          </Text>
        </TouchableOpacity>
      );
    });
  }, [location, heading, devicePitch, getRelativePositionOnScreen, currentLanguage, isRTL]);

  const compassInfo = useMemo(() => {
    if (!selectedPoint || !location) return null;

    const bearing = getBearing(
      location.coords.latitude,
      location.coords.longitude,
      selectedPoint.coordinates.latitude,
      selectedPoint.coordinates.longitude
    );

    const distance = getDistance(
      location.coords.latitude,
      location.coords.longitude,
      selectedPoint.coordinates.latitude,
      selectedPoint.coordinates.longitude
    );

    return (
      <View style={[styles.compassContainer, isRTL && styles.compassContainerRTL]}>
        <Animated.View
          style={[
            styles.compass,
            { transform: [{ rotate: `${bearing - heading}deg` }] },
          ]}
        >
          <MaterialIcons name="navigation" size={40} color={'blue'} />
        </Animated.View>
        <Text style={[styles.compassText, isRTL && { textAlign: 'right' }]}>
          {distance >= 1000
            ? `${(distance / 1000).toFixed(1)} km`
            : `${Math.round(distance)} m`}
        </Text>
      </View>
    );
  }, [selectedPoint, location, heading, getBearing, getDistance, isRTL]);

  if (!isFocused) return null;

  const handleVideoPlaybackStatus = (status: any) => {
    if (status.didJustFinish) {
      setShowIntroVideo(false);
    }
  };

  const currentVideoSource = LANGUAGE_VIDEOS[currentLanguage] || LANGUAGE_VIDEOS.en;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {showIntroVideo ? (
        <View style={styles.videoContainer}>
          <Video
            source={currentVideoSource}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping={false}
            useNativeControls={false}
            style={styles.videoPlayer}
            onPlaybackStatusUpdate={handleVideoPlaybackStatus}
          />
          <TouchableOpacity
            style={[styles.skipButton, isRTL && styles.skipButtonRTL]}
            onPress={() => setShowIntroVideo(false)}
          >
            <Text style={styles.skipButtonText}>{translations?.skipVideo || 'Skip Video'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {hasAllPermissions ? (
            <>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                enableTorch={false}
              />

              <View style={[styles.header, isRTL && styles.headerRTL]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <MaterialIcons
                    name={isRTL ? 'arrow-forward' : 'arrow-back'}
                    size={33}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              {renderedARPoints}
              {compassInfo}

              <Animated.View
                style={[
                  styles.bottomDock,
                  {
                    opacity: dockAnim,
                    transform: [
                      {
                        translateY: dockAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [100, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dockContent}
                >
                  {STATION_POINTS.map((point) => (
                    <TouchableOpacity
                      key={point.id}
                      style={[
                        styles.dockItem,
                        {
                          backgroundColor: selectedPoint?.id === point.id
                            ? themeColors.accent
                            : 'blue',
                        },
                      ]}
                      onPress={() => setSelectedPoint(point)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dockItemText,
                          isRTL && { textAlign: 'right' },
                        ]}
                        numberOfLines={2}
                      >
                        {point.name[currentLanguage] || point.name.en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>

              {selectedPoint && (
                <>
                  <TouchableWithoutFeedback onPress={() => setSelectedPoint(null)}>
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          backgroundColor: 'black',
                          zIndex: 55,
                          opacity: panelAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.5],
                          }),
                        },
                      ]}
                    />
                  </TouchableWithoutFeedback>

                  <Animated.View
                    style={[
                      styles.infoPanel,
                      {
                        backgroundColor: themeColors.card,
                        opacity: panelAnim,
                        transform: [
                          {
                            translateY: panelAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [40, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <TouchableWithoutFeedback>
                      <View>
                        <View style={[styles.infoPanelHeader, isRTL && styles.infoPanelHeaderRTL]}>
                          <View style={[styles.infoPanelTitle, isRTL && styles.infoPanelTitleRTL]}>
                            <Text
                              style={[
                                styles.infoPanelName,
                                { color: themeColors.accent },
                                isRTL && { textAlign: 'right' },
                              ]}
                            >
                              {selectedPoint.name[currentLanguage] || selectedPoint.name.en}
                            </Text>
                            <Text style={[styles.infoPanelIcon, isRTL && styles.infoPanelIconRTL]}>
                              {selectedPoint.icon}
                            </Text>
                          </View>
                        </View>

                        <Image
                          source={selectedPoint.image}
                          style={styles.infoPanelImage}
                          resizeMode="cover"
                        />

                        <Text
                          style={[
                            styles.infoPanelDescription,
                            { color: themeColors.text },
                            isRTL && { textAlign: 'right' },
                          ]}
                        >
                          {selectedPoint.description[currentLanguage] || selectedPoint.description.en}
                        </Text>

                        <TouchableOpacity
                          style={[
                            styles.directionButton,
                            { backgroundColor: themeColors.accent },
                            isRTL && styles.directionButtonRTL,
                          ]}
                          onPress={() => {
                            const url = `http://google.com/maps/dir/?api=1&destination=${selectedPoint.coordinates.latitude},${selectedPoint.coordinates.longitude}&travelmode=walking`;
                            Linking.openURL(url).catch(error => console.error("Failed to open Google Maps:", error));
                          }}
                        >
                          <MaterialIcons
                            name="directions"
                            size={18}
                            color="white"
                            style={isRTL && { transform: [{ scaleX: -1 }] }}
                          />
                          <Text
                            style={[
                              styles.directionButtonText,
                              isRTL && { marginRight: 5, marginLeft: 0 },
                            ]}
                          >
                            {translations.getDirections}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableWithoutFeedback>
                  </Animated.View>
                </>
              )}
            </>
          ) : (
            <View style={[styles.permissionDeniedContainer, { backgroundColor: themeColors.background }]}>
              <MaterialIcons name="camera-alt" size={80} color={themeColors.text} />
              <Text
                style={[
                  styles.permissionDeniedText,
                  { color: themeColors.text },
                  isRTL && { textAlign: 'right' },
                ]}
              >
                {translations?.cameraPermissionNeeded || 'Camera and location access needed for AR.'}
              </Text>
              <TouchableOpacity
                onPress={handleGrantPermissions}
                style={styles.permissionButton}
              >
                <Text style={styles.permissionButtonText}>
                  {translations?.grantPermission || 'Grant Permissions'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  skipButtonRTL: {
    left: 20,
    right: 'auto',
  },
  skipButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: { marginRight: 15 },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  compassContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    alignItems: 'center',
    zIndex: 90,
  },
  compassContainerRTL: {
    right: 'auto',
    left: 20,
  },
  compass: {
    backgroundColor: 'rgba(173, 216, 230, 0.8)',
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  compassText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  arPointContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    zIndex: 50,
  },
  arPointHalo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  arPointIcon: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  arPointText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
    width: 80,
  },
  arPointDistance: {
    color: '#add8e6',
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },

  infoPanel: {
    position: 'absolute',
    bottom: 200,
    left: 30,
    right: 30,
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 60,
  },
  infoPanelHeader: {
    marginBottom: 10,
  },
  infoPanelHeaderRTL: {},
  infoPanelTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoPanelTitleRTL: {
    flexDirection: 'row-reverse',
  },
  infoPanelName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  infoPanelIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  infoPanelIconRTL: {
    marginRight: 10,
    marginLeft: 0,
  },
  infoPanelImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoPanelDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 18,
    textAlign: 'left',
  },
  directionButton: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionButtonRTL: {
    flexDirection: 'row-reverse',
  },
  directionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },

  bottomDock: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockScroll: {
    flex: 1,
  },
  dockContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 10,
    // Removed flexDirection: 'row-reverse' here to keep the visual order consistent
  },
  dockItem: {
    width: 70,
    height: 70,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
  },
  dockItemIcon: {
    fontSize: 16,
    color: 'white',
    marginBottom: 2,
  },
  dockItemText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 9,
  },

  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionDeniedText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});