import React, { useEffect, useState } from 'react';
import {
  View,
  Text, // Ensure Text is imported
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons';

// Type pour les stations de train
interface Station {
  id: string;
  lat: number;
  lng: number;
  city: string;
  label: string;
  phone: string;
  region: string;
}

// Configuration des couleurs du thème
interface ThemeColors {
  background: string;
  text: string;
  accent: string;
  cardBackground: string;
}

const TrainStationsMap: React.FC = () => {
  const router = useRouter();
  const { translations, isDarkMode, isRTL, currentLanguage } = useLanguage();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const themeColors: ThemeColors = {
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    accent: '#ff6600',
    cardBackground: isDarkMode ? '#2d2d2d' : '#f8f8f8',
  };

  const getStationsData = (): Station[] => [
  // Région de Casablanca
  {
    id: 'casa-voyageurs',
    lat: 33.5928,
    lng: -7.6192,
    city: 'Casablanca',
    label: 'Gare Casa Voyageurs',
    phone: '0522503509',
    region: 'Grand Casablanca'
  },
  {
    id: 'casa-port',
    lat: 33.6073,
    lng: -7.6296,
    city: 'Casablanca',
    label: 'Gare Casa Port',
    phone: '0522503510',
    region: 'Grand Casablanca'
  },
  {
    id: 'aeroport-cmn',
    lat: 33.5731,
    lng: -7.5898,
    city: 'Casablanca',
    label: 'Aéroport Mohammed V',
    phone: '0522539040',
    region: 'Grand Casablanca'
  },
  {
    id: 'ain-sebaa',
    lat: 33.5661,
    lng: -7.5522,
    city: 'Casablanca',
    label: 'Gare Ain Sebaâ',
    phone: '',
    region: 'Grand Casablanca'
  },
  {
    id: 'l-oasis',
    lat: 33.5544,
    lng: -7.6211,
    city: 'Casablanca',
    label: 'Gare de l’Oasis',
    phone: '',
    region: 'Grand Casablanca'
  },

  // Région de Rabat-Salé
  {
    id: 'rabat-ville',
    lat: 34.0181,
    lng: -6.8411,
    city: 'Rabat',
    label: 'Gare Rabat Ville',
    phone: '0537774747',
    region: 'Rabat-Salé'
  },
  {
    id: 'rabat-agdal',
    lat: 34.0298,
    lng: -6.8298,
    city: 'Rabat',
    label: 'Gare Rabat Agdal',
    phone: '0537770303',
    region: 'Rabat-Salé'
  },
  {
    id: 'sale',
    lat: 34.0415,
    lng: -6.7834,
    city: 'Salé',
    label: 'Gare Salé',
    phone: '0537882424',
    region: 'Rabat-Salé'
  },
  {
    id: 'kenitra',
    lat: 34.2650,
    lng: -6.5684,
    city: 'Kénitra',
    label: 'Gare Kénitra',
    phone: '0537372828',
    region: 'Rabat-Salé'
  },
  {
    id: 'sidi-bouknadel',
    lat: 34.0100,
    lng: -6.8500,
    city: 'Salé',
    label: 'Gare Sidi Bouknadel',
    phone: '',
    region: 'Rabat-Salé'
  },

  // Région de Fès-Meknès
  {
    id: 'fes',
    lat: 34.0331,
    lng: -5.0003,
    city: 'Fès',
    label: 'Gare Fès',
    phone: '0535933135',
    region: 'Fès-Meknès'
  },
  {
    id: 'meknes',
    lat: 33.8869,
    lng: -5.5473,
    city: 'Meknès',
    label: 'Gare Meknès',
    phone: '0535522061',
    region: 'Fès-Meknès'
  },

  // Région de Marrakech
  {
    id: 'marrakech',
    lat: 31.6295,
    lng: -7.9993,
    city: 'Marrakech',
    label: 'Gare Marrakech',
    phone: '0524447768',
    region: 'Marrakech-Safi'
  },
  {
    id: 'ben-guerir',
    lat: 32.2444,
    lng: -7.3667,
    city: 'Ben Guerir',
    label: 'Gare Ben Guerir',
    phone: '',
    region: 'Marrakech-Safi'
  },
  {
    id: 'youssoufia',
    lat: 32.2667,
    lng: -8.4667,
    city: 'Youssoufia',
    label: 'Gare Youssoufia',
    phone: '',
    region: 'Marrakech-Safi'
  },

  // Région de Tanger
  {
    id: 'tanger-ville',
    lat: 35.7716,
    lng: -5.7862,
    city: 'Tanger',
    label: 'Gare Tanger Ville',
    phone: '0539932110',
    region: 'Tanger-Tétouan'
  },
  {
    id: 'tanger-med',
    lat: 35.7269,
    lng: -5.9138,
    city: 'Tanger',
    label: 'Gare Tanger Med',
    phone: '0539338686',
    region: 'Tanger-Tétouan'
  },

  // Région Oriental
  {
    id: 'taourirt',
    lat: 34.0700,
    lng: -1.8361,
    city: 'Taourirt',
    label: 'Gare Taourirt',
    phone: '',
    region: 'Oriental'
  },
  {
    id: 'oujda',
    lat: 34.6813,
    lng: -1.9103,
    city: 'Oujda',
    label: 'Gare Oujda',
    phone: '',
    region: 'Oriental'
  },
  {
    id: 'nador-ville',
    lat: 35.1744,
    lng: -2.9333,
    city: 'Nador',
    label: 'Gare Nador Ville',
    phone: '',
    region: 'Oriental'
  },
  {
    id: 'nador-sud',
    lat: 35.1744,
    lng: -2.9333,
    city: 'Nador',
    label: 'Gare Nador Sud',
    phone: '',
    region: 'Oriental'
  },

  // Région Casablanca-Settat
  {
    id: 'settat',
    lat: 32.9940,
    lng: -7.6233,
    city: 'Settat',
    label: 'Gare Settat',
    phone: '0523402323',
    region: 'Casablanca-Settat'
  },
  {
    id: 'el-jadida',
    lat: 33.2316,
    lng: -8.5007,
    city: 'El Jadida',
    label: 'Gare El Jadida',
    phone: '0523352929',
    region: 'Casablanca-Settat'
  },
  {
    id: 'azemmour',
    lat: 33.2500,
    lng: -8.5667,
    city: 'Azemmour',
    label: 'Gare Azemmour',
    phone: '',
    region: 'Casablanca-Settat'
  },
  {
    id: 'skhour-rehamna',
    lat: 33.9000,
    lng: -7.0000,
    city: 'Skhour Rehamna',
    label: 'Gare Skhour Rehamna',
    phone: '',
    region: 'Casablanca-Settat'
  },

  // Autres gares importantes
  {
    id: 'khouribga',
    lat: 32.8894,
    lng: -6.9063,
    city: 'Khouribga',
    label: 'Gare Khouribga',
    phone: '',
    region: 'Béni Mellal-Khénifra'
  },
  {
    id: 'safi',
    lat: 32.2888,
    lng: -9.2277,
    city: 'Safi',
    label: 'Gare Safi',
    phone: '0524461913',
    region: 'Marrakech-Safi'
  }

];

  const loadStations = (): void => {
    try {
      const stationsData = getStationsData();
      setStations(stationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des gares:', error);
      Alert.alert(translations.loadingMap || 'Error', 'Impossible de charger les données des gares');
    } finally {
      setLoading(false);
    }
  };

  const makePhoneCall = async (phoneNumber: string): Promise<void> => {
    const phoneUrl = `tel:${phoneNumber}`;
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);

      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          translations.call,
          translations.phoneCallUnavailable,
          [{ text: translations.ok }]
        );
      }
    } catch (err) {
      console.error("Failed to open URL for phone call:", err);
      Alert.alert(
        translations.call,
        translations.phoneCallError,
        [{ text: translations.ok }]
      );
    }
  };

  const handleStationPress = (station: Station): void => {
    const formattedPhone = station.phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');

    Alert.alert(
      station.label,
      `${translations.city}: ${station.city}\n${translations.region}: ${station.region}\n${translations.phone}: ${formattedPhone}`,
      [
        { text: translations.close, style: 'cancel' },
        {
          text: translations.call,
          onPress: () => makePhoneCall(station.phone)
        }
      ]
    );
  };

  useEffect(() => {
    loadStations();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          {translations.loadingMap}
        </Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: 33.5731,
    longitude: -7.5898,
    latitudeDelta: 4.0,
    longitudeDelta: 4.0,
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />

      <View style={[
        styles.header,
        { backgroundColor: themeColors.cardBackground },
        isRTL && styles.headerRTL
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel={translations.back}
        >
          <MaterialIcons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: themeColors.text },
          isRTL && styles.headerTitleRTL
        ]}>
          {translations.stationsMap}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType={isDarkMode ? 'hybrid' : 'standard'}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.lat,
              longitude: station.lng,
            }}
            title={station.label}
            description={`${station.city} - ${station.region}`}
            pinColor={themeColors.accent}
            onPress={() => handleStationPress(station)}
          >
            <Callout style={styles.callout}>
              <View style={[styles.calloutContainer, { backgroundColor: themeColors.cardBackground }]}>
                <Text style={[styles.calloutTitle, { color: themeColors.text }]}>
                  {station.label}
                </Text>
                <Text style={[styles.calloutText, { color: themeColors.text }]}>
                  {station.city}, {station.region}
                </Text>
                {/* FIX APPLIED HERE: Wrap the emoji and text together within a single Text component */}
                <Text style={[styles.calloutPhone, { color: themeColors.accent }]}>
                  📞 {station.phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}
                </Text>
                {/* Or, if you prefer, make it tappable as discussed before: */}
                {/*
                <TouchableOpacity onPress={() => makePhoneCall(station.phone)}>
                  <Text style={[styles.calloutPhone, { color: themeColors.accent }]}>
                    📞 {station.phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}
                  </Text>
                </TouchableOpacity>
                */}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={[
        styles.legend,
        { backgroundColor: themeColors.cardBackground },
        isRTL && styles.legendRTL
      ]}>
        <MaterialIcons
          name="location-on"
          size={20}
          color={themeColors.accent}
          style={isRTL && { transform: [{ scaleX: -1 }] }}
        />
        <Text style={[
          styles.legendText,
          { color: themeColors.text },
          isRTL && styles.legendTextRTL
        ]}>
          {stations.length} {translations.trainStations}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 50,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  headerTitleRTL: {
    marginRight: 10,
    marginLeft: 0,
    textAlign: 'right',
  },
  headerSpacer: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    borderRadius: 8,
  },
  calloutContainer: {
    padding: 12,
    borderRadius: 8,
    minWidth: 180,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  calloutText: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  calloutPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  legendRTL: {
    flexDirection: 'row-reverse',
  },
  legendText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  legendTextRTL: {
    marginRight: 8,
    marginLeft: 0,
    textAlign: 'right',
  },
});

export default TrainStationsMap;