import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export interface Translations {
  officeTitle: string;
  menuTitle: string;
  arVisualization: string;
  settings: string;
  settingsTitle: string;
  appearance: string;
  darkMode: string;
  darkModeDesc: string;
  language: string;
  officialSite: string;
  visitSite: string;
  resetSettings: string;
  resetConfirmTitle: string;
  resetConfirmMessage: string;
  cancel: string;
  reset: string;
  languageChanged: string;
  languageSelectedMessage: string;
  ok: string;
  settingsReset: string;
  settingsResetMessage: string;
  cameraPermissionNeeded: string;
  grantPermission: string;
  // --- ADD THESE MISSING KEYS ---
  permissionsDeniedTitle: string;   // <--- ADD THIS
  permissionsDeniedMessage: string; // <--- ADD THIS
}

export const translations: Record<string, Translations> = {
  fr: {
    officeTitle: "Office National des Chemins de Fer",
    menuTitle: "MENU",
    arVisualization: "Visualisation AR",
    settings: "Paramètres",
    settingsTitle: "Paramètres",
    appearance: "Apparence",
    darkMode: "Mode sombre",
    darkModeDesc: "Activer le thème sombre",
    language: "Langue",
    officialSite: "Site Officiel",
    visitSite: "Visitez notre site web officiel",
    resetSettings: "Réinitialiser les paramètres",
    resetConfirmTitle: "Réinitialiser les paramètres",
    resetConfirmMessage: "Êtes-vous sûr de vouloir réinitialiser tous les paramètres?",
    cancel: "Annuler",
    reset: "Réinitialiser",
    languageChanged: "Langue changée",
    languageSelectedMessage: "Langue sélectionnée:",
    ok: "OK",
    settingsReset: "Réinitialisation",
    settingsResetMessage: "Tous les paramètres ont été réinitialisés.",
    cameraPermissionNeeded: "Accès caméra et localisation nécessaire pour la RA.",
    grantPermission: "Accorder les autorisations",
    // --- ADD FR TRANSLATIONS FOR NEW KEYS ---
    permissionsDeniedTitle: "Autorisations Requises",
    permissionsDeniedMessage: "Veuillez accorder les autorisations de caméra et de localisation dans les paramètres de votre appareil pour utiliser les fonctionnalités AR.",
  },
  en: {
    officeTitle: "National Railway Office",
    menuTitle: "MENU",
    arVisualization: "AR Visualization",
    settings: "Settings",
    settingsTitle: "Settings",
    appearance: "Appearance",
    darkMode: "Dark mode",
    darkModeDesc: "Enable dark theme",
    language: "Language",
    officialSite: "Official Site",
    visitSite: "Visit our official website",
    resetSettings: "Reset Settings",
    resetConfirmTitle: "Reset Settings",
    resetConfirmMessage: "Are you sure you want to reset all settings?",
    cancel: "Cancel",
    reset: "Reset",
    languageChanged: "Language Changed",
    languageSelectedMessage: "Selected language:",
    ok: "OK",
    settingsReset: "Reset Complete",
    settingsResetMessage: "All settings have been reset.",
    cameraPermissionNeeded: "Camera and location access needed for AR.",
    grantPermission: "Grant Permissions",
    // --- ADD EN TRANSLATIONS FOR NEW KEYS ---
    permissionsDeniedTitle: "Permissions Required",
    permissionsDeniedMessage: "Please grant Camera and Location permissions in your device settings to use AR features.",
  },
  ar: {
    officeTitle: "المكتب الوطني للسكك الحديدية",
    menuTitle: "القائمة",
    arVisualization: "تصور الواقع المعزز",
    settings: "الإعدادات",
    settingsTitle: "الإعدادات",
    appearance: "المظهر",
    darkMode: "الوضع المظلم",
    darkModeDesc: "تفعيل المظهر المظلم",
    language: "اللغة",
    officialSite: "الموقع الرسمي",
    visitSite: "قم بزيارة موقعنا الرسمي",
    resetSettings: "إعادة تعيين الإعدادات",
    resetConfirmTitle: "إعادة تعيين الإعدادات",
    resetConfirmMessage: "هل أنت متأكد من أنك تريد إعادة تعيين جميع الإعدادات؟",
    cancel: "إلغاء",
    reset: "إعادة تعيين",
    languageChanged: "تم تغيير اللغة",
    languageSelectedMessage: "اللغة المختارة:",
    ok: "موافق",
    settingsReset: "تم الإعادة",
    settingsResetMessage: "تمت إعادة تعيين جميع الإعدادات.",
    cameraPermissionNeeded: "مطلوب الوصول إلى الكاميرا والموقع للواقع المعزز.",
    grantPermission: "منح الأذونات",
    // --- ADD AR TRANSLATIONS FOR NEW KEYS ---
    permissionsDeniedTitle: "الأذونات مطلوبة",
    permissionsDeniedMessage: "يرجى منح أذونات الكاميرا والموقع في إعدادات جهازك لاستخدام ميزات الواقع المعزز.",
  }
};

interface LanguageContextType {
  currentLanguage: string;
  translations: Translations;
  changeLanguage: (languageCode: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  openOfficialWebsite: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const [language, theme] = await Promise.all([
        AsyncStorage.getItem('appLanguage'),
        AsyncStorage.getItem('darkMode'),
      ]);

      if (language) setCurrentLanguage(language);
      if (theme) setIsDarkMode(theme === 'true');
    };

    loadSettings();
  }, []);

  const changeLanguage = async (languageCode: string) => {
    setCurrentLanguage(languageCode);
    await AsyncStorage.setItem('appLanguage', languageCode);
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', String(newMode));
  };

  const openOfficialWebsite = () => {
    const url = currentLanguage === 'fr'
      ? 'https://www.oncf.ma/fr/'
      : currentLanguage === 'ar'
        ? 'https://www.oncf.ma/ar/'
        : 'https://www.oncf.ma/en/';

    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      translations: translations[currentLanguage] || translations.fr, // Fallback to French if current language translations are missing
      changeLanguage,
      isDarkMode,
      toggleDarkMode,
      openOfficialWebsite
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};