import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/context/LanguageContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    currentLanguage, 
    translations, 
    changeLanguage,
    isDarkMode,
    toggleDarkMode,
    openOfficialWebsite
  } = useLanguage();
  

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  ];

  const handleLanguageSelect = (languageCode: string, languageName: string) => {
    changeLanguage(languageCode);
    Alert.alert(
      translations.languageChanged,
      `${translations.languageSelectedMessage} ${languageName}`,
      [{ text: translations.ok }]
    );
  };

  const handleReset = () => {
    Alert.alert(
      translations.resetConfirmTitle,
      translations.resetConfirmMessage,
      [
        { text: translations.cancel, style: 'cancel' },
        {
          text: translations.reset,
          style: 'destructive',
          onPress: () => {
            if (isDarkMode) toggleDarkMode();
            changeLanguage('fr');
            Alert.alert(
              translations.settingsReset,
              translations.settingsResetMessage,
              [{ text: translations.ok }]
            );
          },
        },
      ]
    );
  };

  const themeColors = {
    background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    cardBackground: isDarkMode ? '#2d2d2d' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    subText: isDarkMode ? '#cccccc' : '#666666',
    border: isDarkMode ? '#404040' : '#e0e0e0',
    accent: '#ff6600',
  };

  const isRTL = currentLanguage === 'ar';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />

      <View style={[
        styles.header, 
        { borderBottomColor: themeColors.border, backgroundColor: themeColors.cardBackground },
        isRTL && styles.headerRTL
      ]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: themeColors.text }]}>
            {isRTL ? '→' : '←'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {translations.settingsTitle}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[
            styles.sectionTitle, 
            { color: themeColors.accent },
            isRTL && styles.textRTL
          ]}>
            {translations.appearance}
          </Text>
          
          <View style={[styles.settingItem, isRTL && styles.settingItemRTL]}>
            <View style={[styles.settingInfo, isRTL && styles.settingInfoRTL]}>
              <Text style={[
                styles.settingTitle, 
                { color: themeColors.text },
                isRTL && styles.textRTL
              ]}>
                {translations.darkMode}
              </Text>
              <Text style={[
                styles.settingSubtitle, 
                { color: themeColors.subText },
                isRTL && styles.textRTL
              ]}>
                {translations.darkModeDesc}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#d3d3d3', true: themeColors.accent }}
              thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[
            styles.sectionTitle, 
            { color: themeColors.accent },
            isRTL && styles.textRTL
          ]}>
            {translations.language}
          </Text>
          
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.languageItem, isRTL && styles.languageItemRTL]}
              onPress={() => handleLanguageSelect(lang.code, lang.name)}
            >
              <Text style={[styles.languageFlag, { color: themeColors.text }]}>
                {lang.flag}
              </Text>
              <Text style={[
                styles.languageName, 
                { color: themeColors.text },
                isRTL && styles.textRTL
              ]}>
                {lang.name}
              </Text>
              {currentLanguage === lang.code && (
                <View style={[styles.selectedIndicator, { backgroundColor: themeColors.accent }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Official Site Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[
            styles.sectionTitle, 
            { color: themeColors.accent },
            isRTL && styles.textRTL
          ]}>
            {translations.officialSite}
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, isRTL && styles.settingItemRTL]}
            onPress={openOfficialWebsite}
          >
            <View style={[styles.settingInfo, isRTL && styles.settingInfoRTL]}>
              <Text style={[
                styles.settingTitle, 
                { color: themeColors.text },
                isRTL && styles.textRTL
              ]}>
                ONCF🔗
              </Text>
              <Text style={[
                styles.settingSubtitle, 
                { color: themeColors.subText },
                isRTL && styles.textRTL
              ]}>
                {translations.visitSite}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Reset Section */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[
            styles.sectionTitle, 
            { color: themeColors.accent },
            isRTL && styles.textRTL
          ]}>
            {translations.reset}
          </Text>
          
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: themeColors.border }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: 'red' }]}>
              {translations.resetSettings}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  section: {
    borderRadius: 12,
    marginVertical: 10,
    padding: 15,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    opacity: 0.9,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingItemRTL: {
    flexDirection: 'row-reverse',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingInfoRTL: {
    alignItems: 'flex-end',
    paddingRight: 0,
    paddingLeft: 10,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  languageItemRTL: {
    flexDirection: 'row-reverse',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 15,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resetButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1.3,
    alignItems: 'center',
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
  },
});