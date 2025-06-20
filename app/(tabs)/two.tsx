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
import { useLanguage } from '../../src/context/LanguageContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CAMERA_FOV_HORIZONTAL = 60; // degrees
const CAMERA_FOV_VERTICAL = 45; // degrees
const MAX_DISPLAY_DISTANCE = 500; // meters
const DEVICE_MOTION_UPDATE_INTERVAL = 100; // ms
const LOCATION_UPDATE_INTERVAL = 1000; // ms

interface StationPoint {
  id: string;
  name: string;
  coordinates: { latitude: number; longitude: number };
  icon: string;
  description: string;
  image: any;
}

const STATION_POINTS: StationPoint[] = [
    {
    id: 'entrance',
    name: 'Entrée de la gare',
    coordinates: { latitude: 34.0470819, longitude: -5.0051884 },
    icon: '🏛️',
    description: 'Entrée principale de la gare',
    image: require('../../assets/images/gare1.png'),
  },
  {
    id: 'ticket',
    name: 'Billetterie',
    coordinates: { latitude: 34.047263, longitude: -5.0049376 },
    icon: '🎫',
    description: 'Achat des billets',
    image: require('../../assets/images/gare20.png'),
  },
  {
    id: 'RS',
    name: 'Rail Shop',
    coordinates: { latitude: 34.0473483, longitude: -5.0056002 },
    icon: '🛍️',
    description: 'Journaux Cadeaux Gadgets',
    image: require('../../assets/images/gare11.png'),
  },
  {
    id: 'access',
    name: 'Accès voie',
    coordinates: { latitude: 34.0474083, longitude: -5.005455 },
    icon: '🚆',
    description: 'Accès aux quais',
    image: require('../../assets/images/gare16.png'),
  },
  {
    id: 'inwi',
    name: 'Agence INWI',
    coordinates: { latitude: 34.0470166, longitude: -5.0055264 },
    icon: '📱',
    description: 'Boutique de téléphonie',
    image: require('../../assets/images/gare7.png'),
  },
  {
    id: 'venicia',
    name: 'Venicia Ice',
    coordinates: { latitude: 34.0471572, longitude: -5.0055918 },
    icon: '🍦',
    description: 'Café et glaces',
    image: require('../../assets/images/gare8.png'),
  },
  {
    id: 'toilet',
    name: 'Toilettes',
    coordinates: { latitude: 34.0475047, longitude: -5.0050466 },
    icon: '🚻',
    description: 'Sanitaires publics',
    image: require('../../assets/images/gare16.png'),
  },
  {
    id: 'cafes',
    name: 'Les Cafés Picasso',
    coordinates: { latitude: 34.0471183, longitude: -5.005576 },
    icon: '☕',
    description: "L'art du café depuis 1993",
    image: require('../../assets/images/gare12.png'),
  },
  {
    id: 'sales',
    name: 'Vente-Conseil',
    coordinates: { latitude: 34.0474244, longitude: -5.0050141 },
    icon: '💬',
    description: 'Service client et conseils',
    image: require('../../assets/images/gare13.png'),
  },
];

export default function ARScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<StationPoint | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [devicePitch, setDevicePitch] = useState<number>(0);
  const [deviceRoll, setDeviceRoll] = useState<number>(0);
  const { translations, isDarkMode } = useLanguage();
  const router = useRouter();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);
  
  // Animation refs
  const panelAnim = useRef(new Animated.Value(0)).current;
  const dockAnim = useRef(new Animated.Value(0)).current;

  // Memoized theme colors
  const themeColors = useMemo(() => ({
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    accent: '#ff6600',
    card: isDarkMode ? '#2d2d2d' : '#ffffff',
  }), [isDarkMode]);

  // Memoized haversine distance calculation
  const getDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRadians = (deg: number) => deg * Math.PI / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  // Memoized bearing calculation
  const getBearing = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRadians = (deg: number) => deg * Math.PI / 180;
    const toDegrees = (rad: number) => rad * 180 / Math.PI;

    const φ1 = toRadians(lat1);
    const λ1 = toRadians(lon1);
    const φ2 = toRadians(lat2);
    const λ2 = toRadians(lon2);

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    return (toDegrees(Math.atan2(y, x)) + 360 % 360);
  }, []);

  // Project 3D point to 2D screen coordinates
  const getRelativePositionOnScreen = useCallback(
    (poi: StationPoint, currentLocation: Location.LocationObject | null) => {
      if (!currentLocation) return null;

      const { latitude: lat1, longitude: lon1 } = currentLocation.coords;
      const { latitude: lat2, longitude: lon2 } = poi.coordinates;

      // Calculate bearing and horizontal angle difference
      let bearingToPOI = getBearing(lat1, lon1, lat2, lon2);
      let horizontalAngleDiff = bearingToPOI - heading;
      
      // Normalize angle difference to [-180, 180]
      horizontalAngleDiff = ((horizontalAngleDiff + 180) % 360) - 180;

      // Simplified vertical angle (assuming same altitude)
      const verticalAngleRelativeToHorizon = 0;
      const verticalAngleDiff = verticalAngleRelativeToHorizon - devicePitch;

      // Check if in FOV
      const isInHorizontalFOV = Math.abs(horizontalAngleDiff) <= CAMERA_FOV_HORIZONTAL / 2;
      const isInVerticalFOV = Math.abs(verticalAngleDiff) <= CAMERA_FOV_VERTICAL / 2;
      if (!isInHorizontalFOV || !isInVerticalFOV) return null;

      // Calculate screen position
      const x = (width / 2) + (horizontalAngleDiff / (CAMERA_FOV_HORIZONTAL / 2)) * (width / 2);
      const y = (height / 2) - (verticalAngleDiff / (CAMERA_FOV_VERTICAL / 2)) * (height / 2);

      const distance = getDistance(lat1, lon1, lat2, lon2);
      return { x, y, distance };
    },
    [heading, devicePitch, getBearing, getDistance]
  );

  // Request and watch location/heading
  const requestAndWatchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);

      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return () => {};
      }

      // Get current location first
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      // Watch for updates
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

    const setupAR = async () => {
      try {
        // Request camera permissions if needed
        if (!cameraPermission?.granted) {
          await requestCameraPermission();
        }

        // Setup location tracking
        cleanupLocation = await requestAndWatchLocation();

        // Setup device motion
        DeviceMotion.setUpdateInterval(DEVICE_MOTION_UPDATE_INTERVAL);
        deviceMotionSubscription = DeviceMotion.addListener((data) => {
          if (data.rotation) {
            setDevicePitch(data.rotation.beta * (180 / Math.PI));
            setDeviceRoll(data.rotation.gamma * (180 / Math.PI));
          }
        });

        // Animate dock in
        if (cameraPermission?.granted) {
          Animated.timing(dockAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }
      } catch (error) {
        console.error('AR setup error:', error);
      }
    };

    setupAR();

    return () => {
      cleanupLocation?.();
      deviceMotionSubscription?.remove();
      DeviceMotion.removeAllListeners();
    };
  }, [isFocused, cameraPermission, requestCameraPermission, requestAndWatchLocation, dockAnim]);

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

  // Memoized AR points rendering
  const renderedARPoints = useMemo(() => {
    if (!location) return null;

    return STATION_POINTS.map((point) => {
      const screenPosition = getRelativePositionOnScreen(point, location);
      if (!screenPosition || screenPosition.distance > MAX_DISPLAY_DISTANCE) return null;

      // Calculate scale based on distance (closer = bigger)
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
          <Text style={styles.arPointText} numberOfLines={1}>
            {point.name}
          </Text>
          <Text style={styles.arPointDistance}>
            {screenPosition.distance >= 1000
              ? `${(screenPosition.distance / 1000).toFixed(1)} km`
              : `${Math.round(screenPosition.distance)} m`}
          </Text>
        </TouchableOpacity>
      );
    });
  }, [location, heading, devicePitch, getRelativePositionOnScreen]);

  // Memoized compass info
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
      <View style={styles.compassContainer}>
        <Animated.View
          style={[
            styles.compass,
            { transform: [{ rotate: `${bearing - heading}deg` }] },
          ]}
        >
          <MaterialIcons name="navigation" size={40} color={'blue'} />
        </Animated.View>
        <Text style={styles.compassText}>
          {distance >= 1000
            ? `${(distance / 1000).toFixed(1)} km`
            : `${Math.round(distance)} m`}
        </Text>
      </View>
    );
  }, [selectedPoint, location, heading, getBearing, getDistance]);

  if (!isFocused) return null;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {hasAllPermissions ? (
        <>
          <CameraView 
            ref={cameraRef} 
            style={styles.camera} 
            facing="back" 
            enableTorch={false} 
          />

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={33} color="white" />
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
                  <Text style={styles.dockItemText} numberOfLines={2}>
                    {point.name}
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
                    <View style={styles.infoPanelHeader}>
                      <View style={styles.infoPanelTitle}>
                        <Text style={[styles.infoPanelName, { color: themeColors.accent }]}>
                          {selectedPoint.name}
                        </Text>
                        <Text style={styles.infoPanelIcon}>{selectedPoint.icon}</Text>
                      </View>
                    </View>

                    <Image
                      source={selectedPoint.image}
                      style={styles.infoPanelImage}
                      resizeMode="cover"
                    />

                    <Text style={[styles.infoPanelDescription, { color: themeColors.text }]}>
                      {selectedPoint.description}
                    </Text>

                    <TouchableOpacity
                      style={[styles.directionButton, { backgroundColor: themeColors.accent }]}
                      onPress={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.coordinates.latitude},${selectedPoint.coordinates.longitude}&travelmode=walking`;
                        Linking.openURL(url).catch(console.error);
                      }}
                    >
                      <MaterialIcons name="directions" size={18} color="white" />
                      <Text style={styles.directionButtonText}>Y aller</Text>
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
          <Text style={[styles.permissionDeniedText, { color: themeColors.text }]}>
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
    </View>
  );
}

// Keep your existing styles...

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },

  // Header
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
  backButton: { marginRight: 15 },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },

  // Floating Compass
  compassContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    alignItems: 'center',
    zIndex: 90,
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

  // AR Point Overlay Styles (Active)
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },

  // Info Panel Above Dock (NOW UNCOMMENTED)
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
  infoPanelTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoPanelName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  infoPanelIcon: {
    fontSize: 24,
    marginLeft: 10,
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
  },
  directionButton: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },

  // Bottom Dock Styles (Active)
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
  },
  // --- DOCK ITEM STYLES (borderRadius active, borderWidth commented out, shadows still out) ---
  dockItem: {
    width: 70,
    height: 70,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35, // <<< This is active
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

  // Permission Denied Styles (Fallback UI)
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